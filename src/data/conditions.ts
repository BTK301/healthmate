export interface Condition {
  id: string;
  name: string;
  hint: string;
}

export const conditions: Condition[] = [
  { id: "hypertension", name: "Tăng huyết áp", hint: "Huyết áp từ 140/90 trở lên" },
  { id: "diabetes_t2", name: "Đái tháo đường type 2", hint: "Đường huyết cao mạn tính" },
  { id: "dyslipidemia", name: "Rối loạn mỡ máu", hint: "Cholesterol hoặc triglyceride cao" },
  { id: "gout", name: "Gout", hint: "Acid uric cao, sưng khớp" },
  { id: "gastritis", name: "Viêm / loét dạ dày", hint: "Đau thượng vị, trào ngược" },
  { id: "anemia", name: "Thiếu máu thiếu sắt", hint: "Hemoglobin thấp" },
  { id: "ckd_mild", name: "Suy thận nhẹ", hint: "Chức năng thận giảm (giai đoạn 1–3a)" },
  { id: "obesity", name: "Béo phì", hint: "BMI từ 25 trở lên (ngưỡng châu Á)" },
];

export const conditionById = new Map(conditions.map((c) => [c.id, c]));
