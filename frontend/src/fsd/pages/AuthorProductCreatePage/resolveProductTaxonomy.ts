import { categoryService } from "@entities/category";
import { fandomService } from "@entities/fandom";
import { subcategoryService } from "@entities/subcategory";
import { isValidSlug, translitToSlug } from "@shared/lib/slug";

async function resolveSubcategorySlug(
    categorySlug: string,
    label: string,
    slugHint: string
): Promise<string | undefined> {
    const trimmed = label.trim();
    if (!trimmed) {
        return undefined;
    }

    const existing = await categoryService.getSubcategories(categorySlug);
    const byHint = existing.find((item) => item.slug === slugHint);
    if (byHint) {
        return byHint.slug;
    }

    const byTitle = existing.find(
        (item) => item.title.toLowerCase() === trimmed.toLowerCase()
    );
    if (byTitle) {
        return byTitle.slug;
    }

    const slug = translitToSlug(trimmed);
    if (!slug || !isValidSlug(slug)) {
        throw new Error("Некорректное название подкатегории");
    }

    const bySlug = existing.find((item) => item.slug === slug);
    if (bySlug) {
        return bySlug.slug;
    }

    const created = await subcategoryService.createSubcategory(categorySlug, {
        title: trimmed,
        slug,
    });
    return created.slug;
}

async function resolveFandomSlug(label: string, slugHint: string): Promise<string | undefined> {
    const trimmed = label.trim();
    if (!trimmed) {
        return undefined;
    }

    const existing = await fandomService.getFandoms();
    const byHint = existing.find((item) => item.slug === slugHint);
    if (byHint) {
        return byHint.slug;
    }

    const byTitle = existing.find(
        (item) => item.title.toLowerCase() === trimmed.toLowerCase()
    );
    if (byTitle) {
        return byTitle.slug;
    }

    const slug = translitToSlug(trimmed);
    if (!slug || !isValidSlug(slug)) {
        throw new Error("Некорректное название фандома");
    }

    const bySlug = existing.find((item) => item.slug === slug);
    if (bySlug) {
        return bySlug.slug;
    }

    const created = await fandomService.createFandom({ title: trimmed, slug });
    return created.slug;
}

export async function resolveProductTaxonomySlugs(form: {
    categorySlug: string;
    subcategoryLabel: string;
    subcategorySlug: string;
    fandomLabel: string;
    fandomSlug: string;
}) {
    const subcategorySlug = form.categorySlug
        ? await resolveSubcategorySlug(
              form.categorySlug,
              form.subcategoryLabel,
              form.subcategorySlug
          )
        : undefined;

    const fandomSlug = await resolveFandomSlug(form.fandomLabel, form.fandomSlug);

    return { subcategorySlug, fandomSlug };
}
