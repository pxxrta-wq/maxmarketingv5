import { Sidebar } from "@/components/layout/Sidebar";
import { Card } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Politique de Confidentialité</h1>
              <p className="text-muted-foreground">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <Card className="p-8 prose prose-invert max-w-none">
            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold text-foreground">1. Introduction</h2>
              <p className="text-muted-foreground">
                Max Marketing ("nous", "notre" ou "nos") s'engage à protéger la confidentialité de vos données personnelles. 
                Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et protégeons vos informations 
                lorsque vous utilisez notre plateforme d'assistant marketing IA.
              </p>

              <h2 className="text-2xl font-bold text-foreground mt-8">2. Données collectées</h2>
              <p className="text-muted-foreground">Nous collectons les types de données suivants :</p>
              <ul className="text-muted-foreground space-y-2">
                <li><strong>Informations de compte :</strong> nom, adresse e-mail, mot de passe crypté</li>
                <li><strong>Données d'utilisation :</strong> contenus générés (e-mails, plans, posts), historique de conversations</li>
                <li><strong>Données techniques :</strong> adresse IP, type de navigateur, système d'exploitation</li>
                <li><strong>Informations de paiement :</strong> traitées de manière sécurisée par Stripe (nous ne stockons pas vos informations bancaires)</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mt-8">3. Utilisation des données</h2>
              <p className="text-muted-foreground">Nous utilisons vos données pour :</p>
              <ul className="text-muted-foreground space-y-2">
                <li>Fournir et améliorer nos services d'IA marketing</li>
                <li>Personnaliser votre expérience utilisateur</li>
                <li>Gérer votre compte et votre abonnement</li>
                <li>Communiquer avec vous concernant les mises à jour et les fonctionnalités</li>
                <li>Assurer la sécurité et prévenir la fraude</li>
                <li>Analyser l'utilisation de la plateforme pour améliorer nos services</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mt-8">4. Partage des données</h2>
              <p className="text-muted-foreground">
                Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations uniquement avec :
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li><strong>Fournisseurs de services :</strong> OpenAI (pour le traitement IA), Stripe (pour les paiements)</li>
                <li><strong>Exigences légales :</strong> si requis par la loi ou pour protéger nos droits</li>
                <li><strong>Transfert d'activité :</strong> en cas de fusion, acquisition ou vente d'actifs</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mt-8">5. Sécurité des données</h2>
              <p className="text-muted-foreground">
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données :
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>Cryptage SSL/TLS pour toutes les transmissions de données</li>
                <li>Stockage sécurisé avec accès restreint</li>
                <li>Authentification sécurisée et hachage des mots de passe</li>
                <li>Audits de sécurité réguliers</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mt-8">6. Vos droits (RGPD)</h2>
              <p className="text-muted-foreground">Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="text-muted-foreground space-y-2">
                <li><strong>Droit d'accès :</strong> consulter vos données personnelles</li>
                <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
                <li><strong>Droit à l'effacement :</strong> supprimer vos données (droit à l'oubli)</li>
                <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
                <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
                <li><strong>Droit de limitation :</strong> demander la limitation du traitement</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Pour exercer ces droits, contactez-nous à : <strong>privacy@maxmarketing.ai</strong>
              </p>

              <h2 className="text-2xl font-bold text-foreground mt-8">7. Cookies</h2>
              <p className="text-muted-foreground">
                Nous utilisons des cookies essentiels pour le fonctionnement de la plateforme (authentification, préférences). 
                Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
              </p>

              <h2 className="text-2xl font-bold text-foreground mt-8">8. Conservation des données</h2>
              <p className="text-muted-foreground">
                Nous conservons vos données personnelles aussi longtemps que votre compte est actif ou que nécessaire pour fournir nos services. 
                Après suppression de votre compte, vos données sont supprimées sous 30 jours, sauf obligation légale de conservation.
              </p>

              <h2 className="text-2xl font-bold text-foreground mt-8">9. Utilisateurs mineurs</h2>
              <p className="text-muted-foreground">
                Max Marketing est destiné aux utilisateurs de 18 ans et plus. Nous ne collectons pas sciemment de données 
                d'enfants de moins de 18 ans.
              </p>

              <h2 className="text-2xl font-bold text-foreground mt-8">10. Modifications de cette politique</h2>
              <p className="text-muted-foreground">
                Nous pouvons mettre à jour cette politique de confidentialité occasionnellement. Nous vous informerons de tout 
                changement significatif par e-mail ou via une notification sur la plateforme.
              </p>

              <h2 className="text-2xl font-bold text-foreground mt-8">11. Contact</h2>
              <p className="text-muted-foreground">
                Pour toute question concernant cette politique de confidentialité ou vos données personnelles, contactez-nous :
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li><strong>E-mail :</strong> privacy@maxmarketing.ai</li>
                <li><strong>Adresse :</strong> Max Marketing SAS, 123 Avenue de l'Innovation, 75001 Paris, France</li>
              </ul>

              <div className="mt-8 p-6 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-foreground">
                  <strong>Responsable du traitement des données :</strong> Max Marketing SAS
                  <br />
                  <strong>Délégué à la protection des données (DPO) :</strong> dpo@maxmarketing.ai
                </p>
              </div>
            </section>
          </Card>
        </div>
      </main>
    </div>
  );
}
