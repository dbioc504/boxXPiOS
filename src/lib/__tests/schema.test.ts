import {
    zUuidV7,
    zLocalId,
    zAnyId,
    zStyle,
    zCategory,
    zCategoryForStyle,
    STYLE_TO_CATEGORIES,
    zComboTemplateRow,
} from "@/types/validation";

function expectOk<T>(schema: any, value: unknown) {
    const r = schema.safeParse(value);
    if (!r.success) {
        throw new Error(JSON.stringify(r.error.issues[0], null, 2));
    }
}

function expectFail<T>(schema: any, value: unknown, contains: string) {
    const r = schema.safeParse(value);
    expect (r.success).toBe(false);
    const txt = JSON.stringify(r, null, 2);
    expect(txt).toContain(contains);
}

function expectZodFail(schema: any, value: unknown, opts: { path: string[], code: string }) {
    const r = schema.safeParse(value);
    expect(r.success).toBe(false);
    if (r.success) return;
    const issue = r.error.issues[0];
    expect(issue.path).toEqual(opts.path);
    expect(issue.code).toEqual(opts.code);
}

test("uuid v7 passes and wrong version fails", () => {
    const good = "018f3c2a-6f7b-7c10-9abc-1def23456789";
    const bad = "550e8400-e29b-41d4-a716-446655440000";

    expectOk(zUuidV7, good);
    expectFail(zUuidV7, bad, "must be UUID v7");
});

test("local id and any id work", () => {
    expectOk(zLocalId, "tmp_123");
    expectOk(zAnyId, "tmp_abc");
    expectOk(zAnyId, "018f3c2a-6f7b-7c10-9abc-1def23456789");
});

test("style and category enums accept only known values", () => {
    expectOk(zStyle, "outboxer");
    expectOk(zCategory, "pressure");
    expectFail(zStyle, "slugger", "Invalid enum");
    expectFail(zCategory, "random_cat", "Invalid enum");
});

test("category must match style rule", () => {
    // pick any allowed pair
    expectOk(zCategoryForStyle, { style: "outboxer", category: "defense" });

    // disallowed pair
    expectFail(
        zCategoryForStyle,
        { style: "outboxer", category: "pressure" },
        "category pressure is not allowed for style outboxer"
    );

    // sanity check against the map
    expect(STYLE_TO_CATEGORIES.outboxer).toEqual([
        "long_range_boxing",
        "footwork",
        "defense",
    ]);
});

test("combo template requires at least two steps, name optional", () => {
    // valid with name
    expectOk(zComboTemplateRow, {
        id: "018f3c2a-6f7b-7c10-9abc-1def23456789",
        name: "Basic 1 2",
        category: "counterpunching",
        steps: ["jab", "straight"],
    });

    // valid without name
    expectOk(zComboTemplateRow, {
        id: "018f3c2a-6f7b-7c10-9abc-1def23456789",
        category: "counterpunching",
        steps: ["jab", "straight"],
    });

    // too few steps
    expectZodFail(
        zComboTemplateRow,
        {
            id: "018f3c2a-6f7b-7c10-9abc-1def23456789",
            category: "counterpunching",
            steps: ["jab"],
        },
        { path: ["steps"], code: "too_small" }
    );
});