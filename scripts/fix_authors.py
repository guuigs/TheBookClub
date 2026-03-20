#!/usr/bin/env python3
"""
fix_authors.py
--------------
Identifie les entrées auteurs en DB dont le nom contient plusieurs auteurs
(séparés par , ou ;) — symptôme de livres importés avant la règle de split.

En mode --fix :
  1. Crée un auteur distinct pour chaque nom
  2. Met à jour le book.author_id avec le premier auteur
  3. Supprime l'ancienne entrée auteur fusionnée

Usage:
    python3 scripts/fix_authors.py          # dry-run (aperçu)
    python3 scripts/fix_authors.py --fix    # corrige réellement

Required env var:
    SUPABASE_SERVICE_ROLE_KEY
"""

import os
import re
import sys
from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://jtgdtydqekakkrvoekqs.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

DRY_RUN = "--fix" not in sys.argv


def split_authors(raw: str) -> list[str]:
    parts = re.split(r"[,;]+", raw)
    return [p.strip() for p in parts if p.strip()]


def upsert_author(sb, name: str) -> str | None:
    res = sb.table("authors").select("id").ilike("name", name).limit(1).execute()
    if res.data:
        return res.data[0]["id"]
    ins = sb.table("authors").insert({"name": name}).execute()
    if ins.data:
        return ins.data[0]["id"]
    print(f"  [ERROR] Impossible de créer l'auteur : {name}")
    return None


def main():
    if not SUPABASE_KEY:
        print("ERROR: SUPABASE_SERVICE_ROLE_KEY is not set.")
        print("  export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'")
        return

    sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    print(f"Connected to Supabase: {SUPABASE_URL}")
    print(f"Mode: {'DRY-RUN (aucune modification)' if DRY_RUN else '⚠️  CORRECTION RÉELLE'}\n")

    # Fetch all authors
    res = sb.table("authors").select("id, name").execute()
    all_authors = res.data or []
    print(f"Total auteurs en DB : {len(all_authors)}")

    # Find authors with multiple names
    multi = [a for a in all_authors if len(split_authors(a["name"])) > 1]
    print(f"Auteurs fusionnés    : {len(multi)}\n")

    if not multi:
        print("Aucun auteur fusionné trouvé. La DB est propre.")
        return

    # For each, find linked books
    for author in multi:
        parts = split_authors(author["name"])
        books_res = sb.table("books").select("id, title").eq("author_id", author["id"]).execute()
        books = books_res.data or []

        print(f"  AUTEUR  : {author['name']}")
        print(f"  → Split : {parts}")
        print(f"  → Livres liés ({len(books)}) :", end="")
        if books:
            print()
            for b in books:
                print(f"      - {b['title'][:60]}")
        else:
            print(" (aucun)")

        if not DRY_RUN:
            # Create individual authors
            new_ids = []
            for name in parts:
                aid = upsert_author(sb, name)
                if aid:
                    new_ids.append(aid)
                    print(f"    ✓ Auteur prêt : {name} ({aid})")

            primary_id = new_ids[0] if new_ids else None

            # Update books to point to first author
            if primary_id and books:
                book_ids = [b["id"] for b in books]
                sb.table("books").update({"author_id": primary_id}).in_("id", book_ids).execute()
                print(f"    ✓ {len(books)} livre(s) mis à jour → {parts[0]}")

            # Delete old fused author entry
            sb.table("authors").delete().eq("id", author["id"]).execute()
            print(f"    ✓ Ancien auteur fusionné supprimé")

        print()

    if DRY_RUN:
        print(f"→ Dry-run terminé. Relance avec --fix pour corriger.")
    else:
        print(f"✓ Correction terminée.")


if __name__ == "__main__":
    main()
