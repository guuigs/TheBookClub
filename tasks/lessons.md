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

## Notes pour Sessions Futures

1. Toujours consulter ce fichier et `tasks/todo.md` avant de commencer
2. Marquer les tâches comme complétées dans todo.md
3. Ajouter les nouvelles leçons apprises ici
4. Le build doit toujours passer avant de finir une session
