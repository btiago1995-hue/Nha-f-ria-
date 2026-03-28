-- Seed Cape Verde Holidays for 2026
INSERT INTO public.holidays_cv (date, name) VALUES
('2026-01-01', 'Ano Novo'),
('2026-01-13', 'Dia da Liberdade e Democracia'),
('2026-01-20', 'Dia dos Heróis Nacionais'),
('2026-02-17', 'Cinzas (Terça-feira de Carnaval)'),
('2026-04-03', 'Sexta-feira Santa'),
('2026-05-01', 'Dia do Trabalhador'),
('2026-05-19', 'Dia do Município da Praia'),
('2026-06-01', 'Dia Internacional das Crianças'),
('2026-07-05', 'Dia da Independência Nacional'),
('2026-08-15', 'Nossa Senhora da Graça'),
('2026-11-01', 'Dia de Todos os Santos'),
('2026-12-25', 'Natal')
ON CONFLICT (date) DO NOTHING;
