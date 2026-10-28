export type FoodGroup =
  | "staple"
  | "protein"
  | "vegetable"
  | "fruit"
  | "dairy"
  | "fat"
  | "condiment"
  | "drink"
  | "dish";

export type FoodSource = "nin" | "estimate";

export interface Food {
  id: string;
  name: string;
  group: FoodGroup;
  /** per 100 g, edible portion, cooked where relevant */
  kcal: number;
  proteinG: number;
  fatG: number;
  carbG: number;
  fiberG: number;
  sodiumMg: number;
  tags: string[];
  source: FoodSource;
}

/**
 * Per-100g values. Staples and simple produce follow the Vietnamese food
 * composition tables; composite dishes are estimates and marked as such.
 */
export const foods: Food[] = [
  // ---------- staples ----------
  { id: "com_trang", name: "Cơm trắng", group: "staple", kcal: 130, proteinG: 2.7, fatG: 0.3, carbG: 28.2, fiberG: 0.4, sodiumMg: 1, tags: [], source: "nin" },
  { id: "com_lut", name: "Cơm gạo lứt", group: "staple", kcal: 123, proteinG: 2.7, fatG: 1.0, carbG: 25.6, fiberG: 1.6, sodiumMg: 2, tags: [], source: "nin" },
  { id: "xoi", name: "Xôi đậu xanh", group: "staple", kcal: 180, proteinG: 5.5, fatG: 2.5, carbG: 34, fiberG: 1.8, sodiumMg: 30, tags: [], source: "nin" },
  { id: "bun", name: "Bún tươi", group: "staple", kcal: 110, proteinG: 1.7, fatG: 0.2, carbG: 25, fiberG: 0.5, sodiumMg: 12, tags: [], source: "nin" },
  { id: "pho", name: "Bánh phở", group: "staple", kcal: 112, proteinG: 3.1, fatG: 0.3, carbG: 24, fiberG: 0.6, sodiumMg: 15, tags: [], source: "nin" },
  { id: "banh_mi", name: "Bánh mì", group: "staple", kcal: 270, proteinG: 8.5, fatG: 2.5, carbG: 52, fiberG: 2.2, sodiumMg: 480, tags: ["high-sodium"], source: "nin" },
  { id: "khoai_lang", name: "Khoai lang luộc", group: "staple", kcal: 86, proteinG: 1.6, fatG: 0.1, carbG: 20, fiberG: 3, sodiumMg: 28, tags: [], source: "nin" },
  { id: "khoai_tay", name: "Khoai tây luộc", group: "staple", kcal: 77, proteinG: 2, fatG: 0.1, carbG: 17, fiberG: 2.2, sodiumMg: 5, tags: ["high-potassium"], source: "nin" },
  { id: "yen_mach", name: "Yến mạch", group: "staple", kcal: 370, proteinG: 13, fatG: 7, carbG: 60, fiberG: 10, sodiumMg: 5, tags: [], source: "estimate" },
  { id: "mi_goi", name: "Mì gói", group: "staple", kcal: 448, proteinG: 9, fatG: 17, carbG: 65, fiberG: 2, sodiumMg: 1100, tags: ["high-sodium", "processed"], source: "estimate" },
  { id: "mien", name: "Miến khô", group: "staple", kcal: 335, proteinG: 0.2, fatG: 0.1, carbG: 82, fiberG: 0.5, sodiumMg: 5, tags: [], source: "estimate" },

  // ---------- protein ----------
  { id: "uc_ga", name: "Ức gà", group: "protein", kcal: 165, proteinG: 31, fatG: 3.6, carbG: 0, fiberG: 0, sodiumMg: 74, tags: [], source: "nin" },
  { id: "dui_ga", name: "Đùi gà", group: "protein", kcal: 209, proteinG: 26, fatG: 10.9, carbG: 0, fiberG: 0, sodiumMg: 88, tags: [], source: "nin" },
  { id: "thit_ba_chi", name: "Thịt ba chỉ", group: "protein", kcal: 518, proteinG: 9.3, fatG: 53, carbG: 0, fiberG: 0, sodiumMg: 32, tags: ["high-fat"], source: "nin" },
  { id: "thit_nac", name: "Thịt nạc vai", group: "protein", kcal: 143, proteinG: 21, fatG: 6, carbG: 0, fiberG: 0, sodiumMg: 53, tags: [], source: "nin" },
  { id: "thit_bo", name: "Thịt bò bắp", group: "protein", kcal: 250, proteinG: 26, fatG: 15, carbG: 0, fiberG: 0, sodiumMg: 55, tags: ["high-purine"], source: "nin" },
  { id: "ca_loc", name: "Cá lóc", group: "protein", kcal: 90, proteinG: 18.5, fatG: 1.5, carbG: 0, fiberG: 0, sodiumMg: 60, tags: ["purine"], source: "nin" },
  { id: "ca_basa", name: "Cá basa", group: "protein", kcal: 90, proteinG: 16, fatG: 3, carbG: 0, fiberG: 0, sodiumMg: 70, tags: ["purine"], source: "estimate" },
  { id: "tom", name: "Tôm tươi", group: "protein", kcal: 99, proteinG: 24, fatG: 0.3, carbG: 0, fiberG: 0, sodiumMg: 111, tags: ["high-purine"], source: "nin" },
  { id: "trung_ga", name: "Trứng gà", group: "protein", kcal: 155, proteinG: 13, fatG: 11, carbG: 1.1, fiberG: 0, sodiumMg: 124, tags: [], source: "nin" },
  { id: "dau_hu", name: "Đậu hũ", group: "protein", kcal: 76, proteinG: 8, fatG: 4.8, carbG: 1.9, fiberG: 0.3, sodiumMg: 7, tags: [], source: "nin" },
  { id: "dau_hu_chien", name: "Đậu hũ chiên", group: "protein", kcal: 271, proteinG: 17, fatG: 20, carbG: 6, fiberG: 1, sodiumMg: 15, tags: ["high-fat", "fried"], source: "estimate" },
  { id: "cha_lua", name: "Chả lụa", group: "protein", kcal: 230, proteinG: 15, fatG: 17, carbG: 4, fiberG: 0, sodiumMg: 900, tags: ["high-sodium", "processed"], source: "estimate" },
  { id: "xuc_xich", name: "Xúc xích", group: "protein", kcal: 290, proteinG: 12, fatG: 25, carbG: 3, fiberG: 0, sodiumMg: 1100, tags: ["high-sodium", "processed", "high-fat"], source: "estimate" },
  { id: "sua_dau_nanh", name: "Sữa đậu nành", group: "protein", kcal: 54, proteinG: 3.3, fatG: 1.8, carbG: 6, fiberG: 0.6, sodiumMg: 51, tags: ["dairy"], source: "estimate" },

  // ---------- vegetables ----------
  { id: "rau_muong", name: "Rau muống", group: "vegetable", kcal: 19, proteinG: 2.6, fatG: 0.3, carbG: 3.1, fiberG: 2.1, sodiumMg: 40, tags: ["vitamin-k"], source: "nin" },
  { id: "cai_ngot", name: "Cải ngọt", group: "vegetable", kcal: 13, proteinG: 1.5, fatG: 0.2, carbG: 2.2, fiberG: 1, sodiumMg: 24, tags: ["vitamin-k"], source: "nin" },
  { id: "bap_cai", name: "Bắp cải", group: "vegetable", kcal: 25, proteinG: 1.3, fatG: 0.1, carbG: 5.8, fiberG: 2.5, sodiumMg: 18, tags: ["vitamin-k"], source: "nin" },
  { id: "ca_chua", name: "Cà chua", group: "vegetable", kcal: 18, proteinG: 0.9, fatG: 0.2, carbG: 3.9, fiberG: 1.2, sodiumMg: 5, tags: ["high-potassium"], source: "nin" },
  { id: "dua_leo", name: "Dưa leo", group: "vegetable", kcal: 15, proteinG: 0.7, fatG: 0.1, carbG: 3.6, fiberG: 0.5, sodiumMg: 2, tags: [], source: "nin" },
  { id: "ca_rot", name: "Cà rốt", group: "vegetable", kcal: 41, proteinG: 0.9, fatG: 0.2, carbG: 9.6, fiberG: 2.8, sodiumMg: 69, tags: [], source: "nin" },
  { id: "bi_do", name: "Bí đỏ", group: "vegetable", kcal: 26, proteinG: 1, fatG: 0.1, carbG: 6.5, fiberG: 0.5, sodiumMg: 1, tags: [], source: "nin" },
  { id: "kho_qua", name: "Khổ qua", group: "vegetable", kcal: 17, proteinG: 1, fatG: 0.2, carbG: 3.7, fiberG: 2.8, sodiumMg: 5, tags: [], source: "nin" },
  { id: "nam_rom", name: "Nấm rơm", group: "vegetable", kcal: 22, proteinG: 3, fatG: 0.3, carbG: 3, fiberG: 1, sodiumMg: 15, tags: [], source: "nin" },
  { id: "rau_ngot", name: "Rau ngót", group: "vegetable", kcal: 35, proteinG: 5.3, fatG: 0.4, carbG: 3.4, fiberG: 2.5, sodiumMg: 25, tags: ["vitamin-k"], source: "nin" },
  { id: "rau_thom", name: "Rau thơm", group: "vegetable", kcal: 20, proteinG: 2, fatG: 0.3, carbG: 2.5, fiberG: 2, sodiumMg: 15, tags: ["vitamin-k"], source: "estimate" },

  // ---------- fruit ----------
  { id: "chuoi", name: "Chuối", group: "fruit", kcal: 89, proteinG: 1.1, fatG: 0.3, carbG: 22.8, fiberG: 2.6, sodiumMg: 1, tags: ["high-potassium"], source: "nin" },
  { id: "cam", name: "Cam", group: "fruit", kcal: 47, proteinG: 0.9, fatG: 0.1, carbG: 11.8, fiberG: 2.4, sodiumMg: 0, tags: ["high-potassium"], source: "nin" },
  { id: "tao", name: "Táo", group: "fruit", kcal: 52, proteinG: 0.3, fatG: 0.2, carbG: 13.8, fiberG: 2.4, sodiumMg: 1, tags: [], source: "nin" },
  { id: "xoai", name: "Xoài", group: "fruit", kcal: 60, proteinG: 0.8, fatG: 0.4, carbG: 15, fiberG: 1.6, sodiumMg: 1, tags: [], source: "nin" },
  { id: "du_du", name: "Đu đủ", group: "fruit", kcal: 43, proteinG: 0.5, fatG: 0.3, carbG: 10.8, fiberG: 1.7, sodiumMg: 8, tags: [], source: "nin" },
  { id: "dua_hau", name: "Dưa hấu", group: "fruit", kcal: 30, proteinG: 0.6, fatG: 0.2, carbG: 7.6, fiberG: 0.4, sodiumMg: 1, tags: [], source: "nin" },
  { id: "bo", name: "Bơ", group: "fruit", kcal: 160, proteinG: 2, fatG: 14.7, carbG: 8.5, fiberG: 6.7, sodiumMg: 7, tags: ["high-fat", "high-potassium"], source: "nin" },
  { id: "hat_dieu", name: "Hạt điều", group: "fruit", kcal: 553, proteinG: 18, fatG: 44, carbG: 30, fiberG: 3.3, sodiumMg: 12, tags: ["high-fat"], source: "estimate" },

  // ---------- dairy ----------
  { id: "sua_tuoi", name: "Sữa tươi", group: "dairy", kcal: 61, proteinG: 3.2, fatG: 3.3, carbG: 4.8, fiberG: 0, sodiumMg: 44, tags: ["dairy", "calcium"], source: "nin" },
  { id: "sua_chua", name: "Sữa chua", group: "dairy", kcal: 61, proteinG: 3.5, fatG: 3.3, carbG: 4.7, fiberG: 0, sodiumMg: 46, tags: ["dairy", "calcium"], source: "nin" },

  // ---------- fats & condiments ----------
  { id: "dau_an", name: "Dầu ăn", group: "fat", kcal: 884, proteinG: 0, fatG: 100, carbG: 0, fiberG: 0, sodiumMg: 0, tags: ["high-fat"], source: "nin" },
  { id: "nuoc_mam", name: "Nước mắm", group: "condiment", kcal: 35, proteinG: 5, fatG: 0, carbG: 3.6, fiberG: 0, sodiumMg: 7000, tags: ["high-sodium"], source: "nin" },
  { id: "muoi", name: "Muối", group: "condiment", kcal: 0, proteinG: 0, fatG: 0, carbG: 0, fiberG: 0, sodiumMg: 38000, tags: ["high-sodium"], source: "nin" },
  { id: "duong", name: "Đường", group: "condiment", kcal: 387, proteinG: 0, fatG: 0, carbG: 100, fiberG: 0, sodiumMg: 0, tags: ["high-sugar", "added-sugar"], source: "nin" },
  { id: "tuong_ot", name: "Tương ớt", group: "condiment", kcal: 60, proteinG: 1.5, fatG: 0.5, carbG: 12, fiberG: 1, sodiumMg: 2000, tags: ["high-sodium", "spicy"], source: "estimate" },

  // ---------- drinks ----------
  { id: "ca_phe", name: "Cà phê đen", group: "drink", kcal: 2, proteinG: 0.1, fatG: 0, carbG: 0.7, fiberG: 0, sodiumMg: 2, tags: ["caffeine"], source: "estimate" },
  { id: "tra_xanh", name: "Trà xanh", group: "drink", kcal: 1, proteinG: 0.2, fatG: 0, carbG: 0.2, fiberG: 0, sodiumMg: 0, tags: ["caffeine"], source: "estimate" },
  { id: "bia", name: "Bia", group: "drink", kcal: 43, proteinG: 0.5, fatG: 0, carbG: 3.6, fiberG: 0, sodiumMg: 4, tags: ["alcohol"], source: "estimate" },
  { id: "nuoc_ngot", name: "Nước ngọt", group: "drink", kcal: 41, proteinG: 0, fatG: 0, carbG: 10.6, fiberG: 0, sodiumMg: 4, tags: ["high-sugar", "added-sugar"], source: "estimate" },
];

export const foodById = new Map(foods.map((f) => [f.id, f]));

export function getFood(id: string): Food {
  const food = foodById.get(id);
  if (!food) throw new Error(`Unknown food: ${id}`);
  return food;
}

/** Quick search by Vietnamese name, accent-insensitive. */
export function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function searchFoods(query: string, limit = 8) {
  const q = normalize(query.trim());
  if (!q) return [];
  return foods
    .filter((f) => normalize(f.name).includes(q))
    .slice(0, limit);
}
