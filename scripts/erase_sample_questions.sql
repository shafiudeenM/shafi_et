-- Erases all sample questions and their mappings (id LIKE q_sample_%).
-- question_topics rows cascade on question DELETE (FK ON DELETE CASCADE).
DELETE FROM public.questions WHERE id LIKE 'q_sample_%';
