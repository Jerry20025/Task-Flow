import prisma from "../lib/prisma";

export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // spaces → hyphens
        .replace(/[^a-z0-9-]/g, '') // remove special chars
        .replace(/-+/g, '-'); // collapse multiple hyphens
}

export async function generateUniqueSlug(name: string): Promise<string> {
    const base = generateSlug(name);
    let slug = base;
    let counter = 1;

    // Check if slug already exists
    while (await prisma.org.findUnique({ where: { slug } })) {
        slug = `${base}-${counter}`;
        counter++;
    }

    return slug;
}
