# Audit Production - The Book Club
**Date:** 23 mars 2026
**URL:** https://the-book-club-one.vercel.app/

---

## RESUME EXECUTIF

| Catégorie | Statut | Problèmes critiques |
|-----------|--------|---------------------|
| **Légal** | CRITIQUE | 4 pages manquantes obligatoires |
| **Liens** | CRITIQUE | 2 liens cassés (404) |
| **UX/UI** | MOYEN | Pas de page d'erreur, quelques problèmes d'accessibilité |
| **Données** | BON | Collecte minimale, pas de tracking |
| **Sécurité** | BON | CSP, HSTS, RLS en place |

---

## 1. AUDIT LEGAL (CRITIQUE)

### Pages manquantes obligatoires en France

| Page | Statut | Obligation légale |
|------|--------|-------------------|
| `/mentions-legales` | MANQUANTE | **Obligatoire** (Loi LCEN art. 6-III) |
| `/privacy` | **404** | **Obligatoire** (RGPD art. 13-14) |
| `/terms` | **404** | Recommandé (lié depuis inscription) |
| `/cookies` | MANQUANTE | **Obligatoire** (Directive ePrivacy) |

### Conformité RGPD

| Exigence | Statut | Action requise |
|----------|--------|----------------|
| Information sur les données collectées | MANQUANT | Créer page /privacy |
| Consentement cookies | PARTIEL | Bannière existe, mais pas de page détaillée |
| Droit de suppression du compte | MANQUANT | Ajouter fonctionnalité |
| Droit d'export des données | MANQUANT | Ajouter fonctionnalité |
| Base légale du traitement | MANQUANT | Documenter dans /privacy |

### Mentions légales obligatoires (Loi LCEN)

Doivent figurer sur `/mentions-legales` :
- [ ] Nom/prénom ou raison sociale de l'éditeur
- [ ] Adresse du siège social
- [ ] Email de contact
- [ ] Nom du directeur de publication
- [ ] Hébergeur (Vercel Inc.)
- [ ] Numéro SIRET (si applicable)

---

## 2. AUDIT LIENS

### Liens cassés détectés

| URL | Depuis | Erreur |
|-----|--------|--------|
| `/terms` | Page inscription | 404 |
| `/privacy` | Page inscription | 404 |

### Pages testées fonctionnelles

- [x] `/` (Accueil)
- [x] `/livres` (Catalogue)
- [x] `/listes` (Listes)
- [x] `/membres` (Membres)
- [x] `/contact` (Contact)
- [x] `/login` (Connexion)
- [x] `/register` (Inscription)

---

## 3. AUDIT DONNEES COLLECTEES

### Données personnelles stockées

| Donnée | Stockage | Finalité | Base légale |
|--------|----------|----------|-------------|
| Email | Supabase Auth | Authentification | Contrat |
| Mot de passe (hashé) | Supabase Auth | Authentification | Contrat |
| Nom d'affichage | PostgreSQL | Profil public | Consentement |
| Pseudo | PostgreSQL | Identification | Contrat |
| Avatar | Supabase Storage | Profil public | Consentement |
| Biographie | PostgreSQL | Profil public | Consentement |
| Notes de livres | PostgreSQL | Fonctionnalité | Consentement |
| Commentaires | PostgreSQL | Fonctionnalité | Consentement |
| Listes de lecture | PostgreSQL | Fonctionnalité | Consentement |

### Cookies utilisés

| Cookie | Type | Finalité | Durée |
|--------|------|----------|-------|
| `sb-*-auth-token` | Essentiel | Authentification | Session |

### Services tiers

| Service | Données envoyées | Finalité |
|---------|------------------|----------|
| Supabase | Toutes les données | Backend/BDD |
| Google Books API | Requêtes de recherche (aucune donnée user) | Catalogue |
| Google Fonts | IP (automatique) | Polices |
| Vercel | Logs serveur | Hébergement |

### Points positifs

- Aucun tracking (pas de Google Analytics)
- Aucun cookie publicitaire
- Données minimales collectées
- RLS (Row Level Security) activé

---

## 4. AUDIT UX/UI

### Problèmes critiques

| Problème | Impact | Fichier |
|----------|--------|---------|
| Pas de `error.tsx` | Erreurs non gérées | `src/app/error.tsx` manquant |
| `alert()` dans ContactForm | UX incohérente | `src/components/ContactForm.tsx` |

### Problèmes d'accessibilité

| Problème | Impact | Solution |
|----------|--------|----------|
| Modals sans focus trap | Navigation clavier cassée | Implémenter focus trap |
| Boutons icône seuls | Lecteurs d'écran | Ajouter aria-label |
| Pas de `aria-describedby` sur erreurs formulaire | Accessibilité formulaires | Lier erreurs aux inputs |

### Problèmes responsives

| Problème | Impact | Solution |
|----------|--------|----------|
| Largeurs fixes (320px/700px/1200px) | Layouts awkward entre breakpoints | Utiliser max-width + padding |
| Hero 600px fixe | Trop grand sur mobile | Hauteur responsive |

---

## 5. ACTIONS A REALISER

### PRIORITE 1 - Légal (OBLIGATOIRE)

- [x] Créer `/mentions-legales` avec informations éditeur
- [x] Créer `/privacy` (politique de confidentialité RGPD)
- [x] Créer `/terms` (conditions d'utilisation)
- [x] Créer `/cookies` (politique cookies)
- [x] Ajouter liens légaux dans le Footer

### PRIORITE 2 - Corrections techniques

- [x] Créer `error.tsx` pour gestion des erreurs
- [ ] Remplacer `alert()` par toast dans ContactForm
- [ ] Ajouter fonctionnalité suppression de compte (RGPD)
- [ ] Ajouter fonctionnalité export des données (RGPD)

### PRIORITE 3 - UX/UI (recommandé)

- [ ] Implémenter focus trap dans les modals
- [ ] Ajouter aria-label aux boutons icônes
- [ ] Améliorer responsive entre breakpoints
- [ ] Ajouter indicateur force mot de passe

---

## 6. CE QUE L'UTILISATEUR DOIT FAIRE

### Informations à fournir pour les mentions légales

Pour compléter la page `/mentions-legales`, vous devez fournir :

1. **Votre identité** :
   - Nom et prénom (ou raison sociale si entreprise)
   - Adresse postale
   - Email de contact

2. **Statut juridique** :
   - Particulier ou entreprise ?
   - Si entreprise : numéro SIRET

3. **Directeur de publication** :
   - Généralement vous-même pour un site personnel

### Fonctionnalités RGPD à implémenter

Ces fonctionnalités nécessitent du développement supplémentaire :
- Bouton "Supprimer mon compte" dans les paramètres
- Bouton "Exporter mes données" dans les paramètres

---

## 7. CORRECTIONS EFFECTUEES

- [x] Page `/mentions-legales` créée (template à compléter)
- [x] Page `/privacy` créée
- [x] Page `/terms` créée
- [x] Page `/cookies` créée
- [x] Liens légaux ajoutés au Footer
- [x] `error.tsx` créé pour gestion des erreurs
