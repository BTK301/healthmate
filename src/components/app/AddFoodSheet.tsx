"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import type { MealSlot } from "@/core/types";
import { recipes } from "@/data/recipes";
import { foods, normalize } from "@/data/foods";
import { recipeNutrition } from "@/core/nutrition/macros";
import { SLOT_LABEL } from "@/core/planner/plan";
import { kcal, grams } from "@/lib/format";
import { cn } from "@/lib/cn";

const SLOTS: MealSlot[] = ["breakfast", "lunch", "dinner", "snack"];

type Result =
  | { kind: "recipe"; id: string; name: string; kcal: number; proteinG: number }
  | { kind: "food"; id: string; name: string; kcal: number; proteinG: number };

export function AddFoodSheet({
  open,
  onClose,
  onPick,
  defaultSlot = "snack",
}: {
  open: boolean;
  onClose: () => void;
  onPick: (item: {
    slot: MealSlot;
    source: "recipe" | "food";
    sourceId: string;
    name: string;
    grams?: number;
    nutrition: {
      kcal: number;
      proteinG: number;
      fatG: number;
      carbG: number;
      fiberG: number;
      sodiumMg: number;
    };
  }) => void;
  defaultSlot?: MealSlot;
}) {
  const [query, setQuery] = useState("");
  const [slot, setSlot] = useState<MealSlot>(defaultSlot);
  const [selectedFood, setSelectedFood] = useState<string | null>(null);
  const [amount, setAmount] = useState(100);

  const q = normalize(query.trim());

  const results = useMemo(() => {
    const recipeResults: Result[] = recipes
      .filter((r) => !q || normalize(r.name).includes(q))
      .map((r) => {
        const n = recipeNutrition(r);
        return {
          kind: "recipe" as const,
          id: r.id,
          name: r.name,
          kcal: Math.round(n.kcal),
          proteinG: Math.round(n.proteinG),
        };
      });

    const foodResults: Result[] = foods
      .filter((f) => !q || normalize(f.name).includes(q))
      .map((f) => ({
        kind: "food" as const,
        id: f.id,
        name: f.name,
        kcal: Math.round(f.kcal),
        proteinG: Math.round(f.proteinG),
      }));

    const limit = q ? 12 : 6;
    return {
      recipes: recipeResults.slice(0, limit),
      foods: foodResults.slice(0, limit),
      empty: recipeResults.length === 0 && foodResults.length === 0,
    };
  }, [q]);

  const reset = () => {
    setQuery("");
    setSelectedFood(null);
    setAmount(100);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const pickFood = (id: string) => {
    const food = foods.find((f) => f.id === id);
    if (!food) return;
    const k = amount / 100;
    onPick({
      slot,
      source: "food",
      sourceId: id,
      name: food.name,
      grams: amount,
      nutrition: {
        kcal: food.kcal * k,
        proteinG: food.proteinG * k,
        fatG: food.fatG * k,
        carbG: food.carbG * k,
        fiberG: food.fiberG * k,
        sodiumMg: food.sodiumMg * k,
      },
    });
    handleClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-navy/25 backdrop-blur-[2px]"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Thêm món đã ăn"
            className="absolute inset-x-3 bottom-3 flex max-h-[82dvh] flex-col overflow-hidden rounded-[26px] border border-white/70 bg-surface shadow-float sm:inset-x-auto sm:right-6 sm:bottom-6 sm:h-[560px] sm:w-[420px]"
          >
            <header className="flex items-center gap-2.5 border-b border-line/70 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold">Thêm món đã ăn</p>
                <p className="text-[10.5px] text-muted">
                  Chọn bữa, rồi tìm món hoặc nguyên liệu
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Đóng"
                className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-canvas"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="border-b border-line/70 px-4 py-3">
              <div className="flex gap-1.5">
                {SLOTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSlot(s)}
                    className={cn(
                      "rounded-pill px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
                      slot === s
                        ? "bg-navy text-white"
                        : "border border-line bg-white text-navy",
                    )}
                  >
                    {SLOT_LABEL[s]}
                  </button>
                ))}
              </div>

              <div className="relative mt-2.5">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm món hoặc thực phẩm…"
                  className="h-10 w-full rounded-xl border border-line bg-white pr-3 pl-9 text-[12.5px] outline-none focus:border-navy/40"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2">
              {results.empty ? (
                <p className="px-2 py-8 text-center text-[12px] text-muted">
                  Không tìm thấy món nào. Thử từ khoá khác.
                </p>
              ) : (
                <>
                  {results.recipes.length > 0 ? (
                    <>
                      <p className="px-3 pt-1 pb-1.5 text-[10px] font-bold tracking-[0.14em] text-muted uppercase">
                        Món ăn
                      </p>
                      <ul className="space-y-1">
                        {results.recipes.map((r) => (
                          <li key={`recipe-${r.id}`}>
                            <button
                              type="button"
                              onClick={() => {
                                const recipe = recipes.find((x) => x.id === r.id);
                                if (!recipe) return;
                                onPick({
                                  slot,
                                  source: "recipe",
                                  sourceId: r.id,
                                  name: recipe.name,
                                  nutrition: recipeNutrition(recipe),
                                });
                                handleClose();
                              }}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-canvas/80"
                            >
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[12.5px] font-semibold text-navy">
                                  {r.name}
                                </span>
                                <span className="block text-[10.5px] text-muted">
                                  1 phần
                                </span>
                              </span>
                              <span className="tabular shrink-0 text-right">
                                <span className="block text-[12px] font-bold text-navy">
                                  {kcal(r.kcal)}
                                </span>
                                <span className="block text-[10px] text-muted">
                                  {grams(r.proteinG)} đạm
                                </span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}

                  {results.foods.length > 0 ? (
                    <>
                      <p className="px-3 pt-3 pb-1.5 text-[10px] font-bold tracking-[0.14em] text-muted uppercase">
                        Thực phẩm
                      </p>
                      <ul className="space-y-1">
                        {results.foods.map((r) => (
                          <li key={`food-${r.id}`}>
                            <button
                              type="button"
                              onClick={() => setSelectedFood(r.id)}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                                selectedFood === r.id
                                  ? "bg-navy-soft/60"
                                  : "hover:bg-canvas/80",
                              )}
                            >
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[12.5px] font-semibold text-navy">
                                  {r.name}
                                </span>
                                <span className="block text-[10.5px] text-muted">
                                  100 g
                                </span>
                              </span>
                              <span className="tabular shrink-0 text-right">
                                <span className="block text-[12px] font-bold text-navy">
                                  {kcal(r.kcal)}
                                </span>
                                <span className="block text-[10px] text-muted">
                                  {grams(r.proteinG)} đạm
                                </span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </>
              )}
            </div>

            {selectedFood ? (
              <div className="border-t border-line/70 px-4 py-3">
                <div className="flex items-center gap-3">
                  <label className="flex-1">
                    <span className="text-[10.5px] font-semibold text-muted">
                      Khối lượng (g)
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value) || 0)}
                      className="mt-1 h-10 w-full rounded-xl border border-line bg-white px-3 text-[13px] font-medium outline-none focus:border-navy/40"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => pickFood(selectedFood)}
                    className="mt-4 h-10 rounded-pill bg-navy px-5 text-[12.5px] font-semibold text-white"
                  >
                    Thêm vào {SLOT_LABEL[slot].toLowerCase()}
                  </button>
                </div>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
