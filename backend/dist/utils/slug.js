"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSlug = generateSlug;
exports.generateUniqueSlug = generateUniqueSlug;
const prisma_1 = __importDefault(require("../lib/prisma"));
function generateSlug(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // spaces → hyphens
        .replace(/[^a-z0-9-]/g, '') // remove special chars
        .replace(/-+/g, '-'); // collapse multiple hyphens
}
async function generateUniqueSlug(name) {
    const base = generateSlug(name);
    let slug = base;
    let counter = 1;
    // Check if slug already exists
    while (await prisma_1.default.org.findUnique({ where: { slug } })) {
        slug = `${base}-${counter}`;
        counter++;
    }
    return slug;
}
//# sourceMappingURL=slug.js.map