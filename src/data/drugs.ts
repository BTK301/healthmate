export type DrugClass =
  | "nsaid"
  | "antiplatelet"
  | "acei"
  | "arb"
  | "beta-blocker"
  | "ccb"
  | "loop-diuretic"
  | "thiazide"
  | "potassium-sparing"
  | "statin"
  | "biguanide"
  | "sulfonylurea"
  | "thyroid"
  | "anticoagulant"
  | "ppi"
  | "corticosteroid"
  | "fluoroquinolone"
  | "tetracycline"
  | "urate-lowering"
  | "bronchodilator"
  | "penicillin";

export interface Drug {
  id: string;
  name: string;
  /** common Vietnamese brand names, helps the picker feel familiar */
  brands: string[];
  classes: DrugClass[];
  /** shown under the drug in the picker */
  hint: string;
}

export const drugs: Drug[] = [
  { id: "ibuprofen", name: "Ibuprofen", brands: ["Brufen", "Ibufen"], classes: ["nsaid"], hint: "Kháng viêm, giảm đau" },
  { id: "diclofenac", name: "Diclofenac", brands: ["Voltaren"], classes: ["nsaid"], hint: "Kháng viêm, giảm đau" },
  { id: "aspirin", name: "Aspirin", brands: ["Aspirin 81", "Cardioprin"], classes: ["nsaid", "antiplatelet"], hint: "Giảm đau liều thấp / chống kết tập tiểu cầu" },
  { id: "enalapril", name: "Enalapril", brands: ["Renitec"], classes: ["acei"], hint: "Hạ huyết áp" },
  { id: "losartan", name: "Losartan", brands: ["Cozaar", "Lozap"], classes: ["arb"], hint: "Hạ huyết áp" },
  { id: "bisoprolol", name: "Bisoprolol", brands: ["Concor"], classes: ["beta-blocker"], hint: "Hạ huyết áp, kiểm soát nhịp tim" },
  { id: "amlodipine", name: "Amlodipine", brands: ["Amlor", "Stadovas"], classes: ["ccb"], hint: "Hạ huyết áp" },
  { id: "furosemide", name: "Furosemide", brands: ["Lasix"], classes: ["loop-diuretic"], hint: "Lợi tiểu" },
  { id: "hydrochlorothiazide", name: "Hydrochlorothiazide", brands: ["HCTZ"], classes: ["thiazide"], hint: "Lợi tiểu thiazide" },
  { id: "spironolactone", name: "Spironolactone", brands: ["Aldactone"], classes: ["potassium-sparing"], hint: "Lợi tiểu giữ kali" },
  { id: "atorvastatin", name: "Atorvastatin", brands: ["Lipitor", "Atorva"], classes: ["statin"], hint: "Hạ mỡ máu" },
  { id: "simvastatin", name: "Simvastatin", brands: ["Zocor"], classes: ["statin"], hint: "Hạ mỡ máu" },
  { id: "metformin", name: "Metformin", brands: ["Glucophage"], classes: ["biguanide"], hint: "Đái tháo đường type 2" },
  { id: "gliclazide", name: "Gliclazide", brands: ["Diamicron"], classes: ["sulfonylurea"], hint: "Đái tháo đường type 2" },
  { id: "levothyroxine", name: "Levothyroxine", brands: ["Euthyrox", "Thyrox"], classes: ["thyroid"], hint: "Hormone tuyến giáp" },
  { id: "warfarin", name: "Warfarin", brands: ["Coumadin"], classes: ["anticoagulant"], hint: "Chống đông máu" },
  { id: "clopidogrel", name: "Clopidogrel", brands: ["Plavix"], classes: ["antiplatelet"], hint: "Chống kết tập tiểu cầu" },
  { id: "omeprazole", name: "Omeprazole", brands: ["Losec", "Omez"], classes: ["ppi"], hint: "Ức chế tiết acid dạ dày" },
  { id: "prednisolone", name: "Prednisolone", brands: ["Prednisolon"], classes: ["corticosteroid"], hint: "Kháng viêm, dị ứng" },
  { id: "ciprofloxacin", name: "Ciprofloxacin", brands: ["Ciprobay"], classes: ["fluoroquinolone"], hint: "Kháng sinh" },
  { id: "doxycycline", name: "Doxycycline", brands: ["Doxy", "Vibramycin"], classes: ["tetracycline"], hint: "Kháng sinh" },
  { id: "allopurinol", name: "Allopurinol", brands: ["Zyloric"], classes: ["urate-lowering"], hint: "Hạ acid uric" },
  { id: "colchicine", name: "Colchicine", brands: ["Colchicin"], classes: ["urate-lowering"], hint: "Dự phòng cơn gout" },
  { id: "salbutamol", name: "Salbutamol", brands: ["Ventolin"], classes: ["bronchodilator"], hint: "Giãn phế quản" },
  { id: "amoxicillin", name: "Amoxicillin", brands: ["Amoxil"], classes: ["penicillin"], hint: "Kháng sinh" },
];

export const drugById = new Map(drugs.map((d) => [d.id, d]));

export function drugsOfClasses(ids: string[], classes: DrugClass[]) {
  return ids
    .map((id) => drugById.get(id))
    .filter((d): d is Drug => Boolean(d))
    .filter((d) => d.classes.some((c) => classes.includes(c)));
}
