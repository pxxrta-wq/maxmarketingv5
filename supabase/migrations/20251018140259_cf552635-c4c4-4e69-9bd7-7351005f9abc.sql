-- Create enum for subscription status
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid');

-- Create enum for payment provider
CREATE TYPE payment_provider AS ENUM ('stripe', 'paypal');

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  paypal_subscription_id TEXT UNIQUE,
  provider payment_provider NOT NULL DEFAULT 'stripe',
  status subscription_status NOT NULL DEFAULT 'incomplete',
  plan_name TEXT NOT NULL DEFAULT 'premium',
  price_amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_active_subscription UNIQUE (user_id, status)
);

-- Create payment_transactions table for audit trail
CREATE TABLE public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  provider payment_provider NOT NULL,
  provider_transaction_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL,
  payment_method TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for payment_transactions
CREATE POLICY "Users can view own transactions"
  ON public.payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all transactions"
  ON public.payment_transactions FOR ALL
  USING (auth.role() = 'service_role');

-- Create indexes for performance
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_subscription_id ON public.payment_transactions(subscription_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for subscriptions
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions
    WHERE user_id = user_id_param
      AND status = 'active'
      AND (current_period_end IS NULL OR current_period_end > NOW())
  );
$$;