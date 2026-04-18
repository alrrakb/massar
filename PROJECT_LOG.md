# سجل تطور المشروع (Project Log)

## 📅 2026-04-12 - إصلاحات بنك الأسئلة وربطه بمحرك الامتحانات
- **تم**: إصلاح مشكلة تحديد الـ `course_id` في نموذج بنك الأسئلة.
- **تم**: إصلاح مشكلة الـ Focus عند الكتابة في خيارات الأسئلة (استخدام `useFieldArray.update` بدلاً من `setValue`).
- **تم**: إصلاح مشكلة تحديد الإجابة الصحيحة لأسئلة True/False (التحقق من `text` بدلاً من `id`).
- **تم**: إصلاح تحميل خيارات True/False عند تعديل سؤال موجود.
- **تم**: توحيد أنواع الأسئلة المقالية: دمج `essay` و `short_answer` في نوع واحد `essay`.
- **تم**: ربط بنك الأسئلة بمحرك إنشاء الامتحانات (إضافة `QuestionBankPicker` وتحديث `Step2Builder`).
- **الملفات المُعدّلة**: 
  - `src/features/question-bank/types/index.ts`
  - `src/pages/teacher/QuestionBank/components/QuestionFormModal.tsx`
  - `src/features/exam-creator/components/QuestionBankPicker.tsx`
  - `src/features/exam-creator/components/Step2Builder.tsx`
  - `src/features/exam-creator/ExamCreator.tsx`
  - `src/features/exam-creator/ExamCreator.module.css`
  - `src/features/exam-creator/types.ts`

## 📅 [التاريخ السابق] - المرحلة 1: الإعداد والبنية التحتية
- **تم**: تهيئة مشروع React + TypeScript.
- **تم**: إعداد هيكلية المجلدات الأساسية.
- **تم**: ربط المشروع بـ Supabase.
- **تم**: إنشاء ملفات التوثيق الأولية.

---
*سيتم تحديث هذا الملف دورياً مع كل مرحلة جديدة.*
