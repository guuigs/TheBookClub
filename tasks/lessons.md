# TheBookClub - Lessons Learned

> Fichier de documentation des patterns et leçons apprises

---

## Patterns Techniques Établis

### 1. Structure des Pages
- Utiliser `use(params)` pour les routes dynamiques (Next.js 16+)
- Implémenter `generateStaticParams` pour SSG quand possible
- Toujours gérer le cas "not found" avec `notFound()`

### 2. Composants
- Utiliser `forwardRef` pour les composants interactifs (Button, Input)
- Exporter les types dans les fichiers index.ts
- Nommer les variantes de composants clairement (BookCard vs BookCardOverlay)

### 3. Tailwind CSS
- **ATTENTION**: Les classes dynamiques `className={`xxx-${var}`}` ne fonctionnent pas avec Tailwind
  - Solution: utiliser des objets de mapping ou inline styles
- Utiliser les CSS variables du design system (`var(--color-primary)`)

### 4. TypeScript
- Définir tous les types dans `src/types/index.ts`
- Utiliser des union types pour les valeurs fixes (Rating = 1 | 2 | ... | 10)
- Toujours typer les props de composants

---

## Erreurs à Éviter

1. **Ne pas utiliser de classes Tailwind dynamiques**
   ```tsx
   // ❌ MAUVAIS
   className={`line-clamp-${maxLines}`}

   // ✅ BON
   style={{ WebkitLineClamp: maxLines }}
   // ou
   const lineClampMap = { 3: 'line-clamp-3', 5: 'line-clamp-5' }
   className={lineClampMap[maxLines]}
   ```

2. **Ne pas dupliquer les données statiques**
   - Les labels de badges doivent être centralisés
   - Utiliser un seul fichier source de vérité

3. **Ne pas oublier les états de chargement**
   - Ajouter `loading.tsx` pour les routes dynamiques
   - Utiliser Suspense boundaries

---

## Décisions d'Architecture

### Design System
- Couleurs définies en CSS variables dans globals.css
- Typographie responsive (desktop/mobile)
- Font display: Mediamoure (titres déco)
- Font sans: Manrope (body text)

### Structure des Dossiers
```
src/
├── app/          # Pages (App Router)
├── components/
│   ├── ui/       # Composants atomiques
│   ├── layout/   # Header, Footer
│   └── features/ # Composants métier
├── lib/          # Utilitaires, API clients
├── types/        # TypeScript types
└── fonts/        # Polices locales
```

### Conventions de Nommage
- Pages: `page.tsx` (convention Next.js)
- Composants: PascalCase (`BookCard.tsx`)
- Hooks: camelCase avec préfixe `use` (`useAuth.ts`)
- Actions: camelCase (`createReview.ts`)

---

## Securite Supabase (Ajout 18 mars 2026)

### 1. RLS est OBLIGATOIRE
- **TOUJOURS activer RLS** sur chaque table avec `ALTER TABLE xxx ENABLE ROW LEVEL SECURITY`
- Les validations cote client (TypeScript) peuvent etre contournees
- RLS est la seule vraie protection au niveau base de donnees

### 2. Principe du Moindre Privilege
- SELECT public = donnees affichees publiquement (commentaires, profils)
- SELECT owner = donnees privees (ratings, statut de lecture)
- INSERT/UPDATE/DELETE = toujours verifier `auth.uid() = user_id`

### 3. Fonctions SECURITY DEFINER pour Aggregation
```sql
-- Pour acceder a des donnees privees de maniere agregee
CREATE FUNCTION get_stats(book_id UUID)
RETURNS TABLE(...) LANGUAGE sql
SECURITY DEFINER  -- Bypass RLS de maniere controlee
STABLE
AS $$ ... $$;
```

### 4. Pattern de Verification Ownership
```sql
-- Pour les tables enfants (book_list_items appartient a book_lists)
CREATE POLICY "List owners can manage items" ON book_list_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM book_lists
    WHERE book_lists.id = book_list_items.list_id
    AND book_lists.author_id = auth.uid()
  )
);
```

### 5. Migrations = Documentation Securite
- Chaque table doit avoir sa migration RLS documentee
- Format: `XXX_description.sql` dans `tasks/migrations/`
- Inclure des commentaires expliquant les choix de securite

---

## Notes pour Sessions Futures

1. Toujours consulter ce fichier et `tasks/todo.md` avant de commencer
2. Marquer les tâches comme complétées dans todo.md
3. Ajouter les nouvelles leçons apprises ici
4. Le build doit toujours passer avant de finir une session
5. **SECURITE**: Verifier que toute nouvelle table a ses politiques RLS
