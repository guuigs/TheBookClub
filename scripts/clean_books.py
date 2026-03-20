#!/usr/bin/env python3
"""
clean_books.py
--------------
Supprime de la DB les livres qui satisfont au moins un critère :
  - pas de synopsis (description vide/null)
  - synopsis contenant des balises HTML (< ou >)
  - pas de cover (cover_url vide/null)
  - cover dont l'URL contient "image not available" (placeholder Google Books)

Usage:
    python3 scripts/clean_books.py           # dry-run (aperçu sans supprimer)
    python3 scripts/clean_books.py --delete  # supprime réellement

Required env var:
    SUPABASE_SERVICE_ROLE_KEY
"""

import os
import re
import sys
from supabase import create_client

# Patterns identifying invalid covers (case-insensitive)
INVALID_COVER_PATTERNS = [
    r"image[_\s]?not[_\s]?available",
    r"no[_\s]?image",
    r"noimage",
    r"placeholder",
]
INVALID_COVER_RE = re.compile("|".join(INVALID_COVER_PATTERNS), re.IGNORECASE)

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://jtgdtydqekakkrvoekqs.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

DRY_RUN = "--delete" not in sys.argv


def main():
    if not SUPABASE_KEY:
        print("ERROR: SUPABASE_SERVICE_ROLE_KEY is not set.")
        print("  export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'")
        return

    sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    print(f"Connected to Supabase: {SUPABASE_URL}")
    print(f"Mode: {'DRY-RUN (aucune suppression)' if DRY_RUN else '⚠️  SUPPRESSION RÉELLE'}\n")

    # Fetch all books with id, title, description, cover_url
    res = sb.table("books").select("id, title, description, cover_url").execute()
    all_books = res.data or []
    print(f"Total livres en DB : {len(all_books)}")

    to_delete = []
    for book in all_books:
        reasons = []

        desc = book.get("description") or ""
        cover = book.get("cover_url") or ""

        if not desc:
            reasons.append("synopsis manquant")
        elif len(desc) < 100:
            reasons.append(f"synopsis trop court ({len(desc)} car.)")
        elif "<" in desc or ">" in desc:
            reasons.append("synopsis HTML")
        elif (
            "4ème de couverture" in desc
            or "4eme de couverture" in desc
            or "4e de couverture" in desc
            or ("4" in desc and "couverture" in desc)
        ):
            reasons.append("synopsis 4ème de couverture")

        if not cover:
            reasons.append("cover manquante")
        elif INVALID_COVER_RE.search(cover):
            reasons.append("cover indisponible")

        if reasons:
            to_delete.append((book["id"], book["title"], reasons))

    print(f"Livres à supprimer  : {len(to_delete)}\n")

    if not to_delete:
        print("Rien à supprimer.")
        return

    # Preview
    for book_id, title, missing in to_delete:
        print(f"  [{', '.join(missing):20s}] {title[:60]}")

    if DRY_RUN:
        print("\n→ Dry-run terminé. Relance avec --delete pour supprimer.")
        return

    # Confirm
    print(f"\nSuppression de {len(to_delete)} livres...")
    ids = [b[0] for b in to_delete]

    # Delete in batches of 100 to stay within URL limits
    batch_size = 100
    deleted = 0
    for i in range(0, len(ids), batch_size):
        batch = ids[i : i + batch_size]
        sb.table("books").delete().in_("id", batch).execute()
        deleted += len(batch)
        print(f"  Supprimés : {deleted}/{len(ids)}")

    print(f"\n✓ {deleted} livres supprimés.")


if __name__ == "__main__":
    main()
