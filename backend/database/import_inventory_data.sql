-- Auto-generated inventory import SQL

-- Generated from CSV data with auto-generated SKUs


INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Skimmed Milk Powder', 'MOTHERDAIRY-SKIMMEDMILKPOWDER', 'Raw Materials', 'kg', 2850.0, 0, 5700.0, 'Mother dairy', NULL, '25kg', NULL, NULL, NULL, 320.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Skimmed Milk Powder', 'CHITELY-SKIMMEDMILKPOWDER', 'Raw Materials', 'kg', 750.0, 0, 1500.0, 'Chitely', NULL, '25kg', NULL, NULL, NULL, 310.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Skimmed Milk Powder', 'SAPUTO-SKIMMEDMILKPOWDER', 'Raw Materials', 'kg', 250.0, 0, 500.0, 'Saputo', NULL, '25kg', NULL, NULL, NULL, 350.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Skimmed Milk Powder', 'SAWANRIYA-SKIMMEDMILKPOWDER', 'Raw Materials', 'kg', 2250.0, 0, 4500.0, 'Sawanriya', NULL, '25kg', NULL, NULL, NULL, 300.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Skimmed Milk Powder', 'SACHI-SKIMMEDMILKPOWDER', 'Raw Materials', 'kg', 4750.0, 0, 9500.0, 'Sachi', NULL, '25kg', NULL, NULL, NULL, 315.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Skimmed Milk Powder', 'ROYAL-SKIMMEDMILKPOWDER', 'Raw Materials', 'kg', 425.0, 0, 850.0, 'Royal', NULL, '25kg', NULL, NULL, NULL, 325.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Skimmed Milk Powder', 'SANCHIG-SKIMMEDMILKPOWDER', 'Raw Materials', 'kg', 500.0, 0, 1000.0, 'Sanchi (g)', NULL, '25kg', NULL, NULL, NULL, 318.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Skimmed Milk Powder', 'MAAANJANI-SKIMMEDMILKPOWDER', 'Raw Materials', 'kg', 600.0, 0, 1200.0, 'Maa anjani', NULL, '25kg', NULL, NULL, NULL, 312.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Vanpati/Veg Fat', 'GEMINI-VANPATIVEGFAT', 'Raw Materials', 'kg', 1305.0, 0, 2610.0, 'Gemini', NULL, '15kg', NULL, NULL, NULL, 180.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Vanpati/Veg Fat', 'NULL-VANPATIVEGFAT', 'Raw Materials', 'ltr', 0, 0, 100, NULL, NULL, '15kg', NULL, NULL, NULL, 175.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Vanpati/Veg Fat', 'NULL-VANPATIVEGFAT', 'Raw Materials', 'ltr', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 175.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Palmolein Oil', 'SIMPLYGOLD-PALMOLEINOIL', 'Raw Materials', 'ltr', 1005.0, 0, 2010.0, 'Simply gold', NULL, '15kg', NULL, NULL, NULL, 140.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Palmolein Oil', 'LILY-PALMOLEINOIL', 'Raw Materials', 'ltr', 1950.0, 0, 3900.0, 'Lily', NULL, '15kg', NULL, NULL, NULL, 135.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Palmolein Oil', 'NULL-PALMOLEINOIL', 'Raw Materials', 'ltr', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 138.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Sugar', 'VENKATESHWAR-SUGAR', 'Raw Materials', 'kg', 15200.0, 0, 30400.0, 'Venkateshwar', NULL, '50kg', NULL, NULL, NULL, 42.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Sugar', 'NULL-SUGAR', 'Raw Materials', 'kg', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 40.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Sliver leaves', 'JAINAM-SLIVERLEAVES', 'Raw Materials', 'kg', 0, 0, 100, 'Jainam', NULL, NULL, NULL, NULL, NULL, 2500.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Cashews grade', 'NULL-CASHEWSGRADE', 'Raw Materials', 'kg', 60.0, 0, 120.0, NULL, NULL, '10kg', NULL, NULL, NULL, 850.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Whole milk powder (cow) plain', 'NULL-WHOLEMILKPOWDERCOWPLAIN', 'Raw Materials', 'kg', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 380.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Honey', 'NULL-HONEY', 'Raw Materials', 'kg', 15.0, 0, 30.0, NULL, NULL, NULL, NULL, NULL, NULL, 350.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Elaichi(cardamom)', 'NULL-ELAICHICARDAMOM', 'Raw Materials', 'kg', 33.0, 0, 66.0, NULL, NULL, NULL, NULL, NULL, NULL, 1800.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('SMP damage(low quality)', 'SANCHIREDPOWDER-SMPDAMAGELOWQUALITY', 'Raw Materials', 'kg', 1750.0, 0, 3500.0, 'Sanchi/red powder', NULL, '25kg', NULL, NULL, NULL, 250.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Tutty-fruty', 'NULL-TUTTYFRUTY', 'Raw Materials', 'kg', 40.0, 0, 80.0, NULL, NULL, NULL, NULL, NULL, NULL, 180.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Almond slices', 'NULL-ALMONDSLICES', 'Raw Materials', 'kg', 14500.0, 0, 29000.0, NULL, NULL, NULL, NULL, NULL, NULL, 720.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Pista slices', 'NULL-PISTASLICES', 'Raw Materials', 'kg', 2000.0, 0, 4000.0, NULL, NULL, NULL, NULL, NULL, NULL, 1200.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Almonds', 'NULL-ALMONDS', 'Raw Materials', 'kg', 73.5, 0, 147.0, NULL, NULL, NULL, NULL, NULL, NULL, 750.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Coconut lacha (flakes)', 'NULL-COCONUTLACHAFLAKES', 'Raw Materials', 'kg', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 280.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Flavoured elaichi powder', 'NULL-FLAVOUREDELAICHIPOWDER', 'Raw Materials', 'kg', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 450.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Aata (Labour)', 'NULL-AATALABOUR', 'Raw Materials', 'kg', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 35.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Anjeer', 'NULL-ANJEER', 'Raw Materials', 'kg', 17.0, 0, 34.0, NULL, NULL, NULL, NULL, NULL, NULL, 650.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Besan', 'NULL-BESAN', 'Raw Materials', 'kg', 83.0, 0, 166.0, NULL, NULL, NULL, NULL, NULL, NULL, 70.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Food Colour', 'NULL-FOODCOLOUR', 'Raw Materials', 'kg', 6930.0, 0, 13860.0, NULL, NULL, NULL, NULL, NULL, NULL, 500.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Dark and white compound (Chocolate)', 'MORDE-DARKANDWHITECOMPOUNDCHOCOLATE', 'Raw Materials', 'kg', 20.0, 0, 40.0, 'Morde', NULL, NULL, NULL, NULL, NULL, 380.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Choco chips', 'NULL-CHOCOCHIPS', 'Raw Materials', 'kg', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 420.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Coco Powder', 'NULL-COCOPOWDER', 'Raw Materials', 'kg', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 280.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('DTM milk (1.5%fat)', 'NULL-DTMMILK1.5%FAT', 'Raw Materials', 'ltr', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 55.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Elaichi(cardamom) dana', 'NULL-ELAICHICARDAMOMDANA', 'Raw Materials', 'kg', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 2000.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Glucose', 'NULL-GLUCOSE', 'Raw Materials', 'ltr', 187.0, 0, 374.0, NULL, NULL, NULL, NULL, NULL, NULL, 45.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Dates(khajoor)', 'NULL-DATESKHAJOOR', 'Raw Materials', 'kg', 15.0, 0, 30.0, NULL, NULL, NULL, NULL, NULL, NULL, 320.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Khas-khas', 'NULL-KHASKHAS', 'Raw Materials', 'kg', 2.0, 0, 4.0, NULL, NULL, NULL, NULL, NULL, NULL, 1500.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Other dryfruits', 'NULL-OTHERDRYFRUITS', 'Raw Materials', 'kg', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 600.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Pecgel', 'NULL-PECGEL', 'Raw Materials', 'kg', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 250.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Pista whole', 'NULL-PISTAWHOLE', 'Raw Materials', 'kg', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 1400.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Rice Flour', 'NULL-RICEFLOUR', 'Raw Materials', 'kg', 7.5, 0, 15.0, NULL, NULL, NULL, NULL, NULL, NULL, 55.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Baking soda bags', 'NULL-BAKINGSODABAGS', 'Raw Materials', 'kg', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 35.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Skimmed milk (Non fat)', 'NULL-SKIMMEDMILKNONFAT', 'Raw Materials', 'ltr', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 50.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Gulkand', 'NULL-GULKAND', 'Raw Materials', 'kg', 15.0, 0, 30.0, NULL, NULL, NULL, NULL, NULL, NULL, 280.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Mung dal', 'NULL-MUNGDAL', 'Raw Materials', 'kg', 12.0, 0, 24.0, NULL, NULL, NULL, NULL, NULL, NULL, 120.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('SP milk stock', 'NULL-SPMILKSTOCK', 'Raw Materials', 'ltr', 2200.0, 0, 4400.0, NULL, NULL, NULL, NULL, NULL, NULL, 60.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('MILK POWDER', 'GAYATRISMP-MILKPOWDER', 'Raw Materials', 'kg', 550.0, 0, 1100.0, 'GAYATRI SMP', NULL, NULL, NULL, NULL, NULL, 310.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('MILK POWDER', 'OSTROWIASMP-MILKPOWDER', 'Raw Materials', 'kg', 1375.0, 0, 2750.0, 'OSTROWIA SMP', NULL, NULL, NULL, NULL, NULL, 305.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('MILK POWDER', 'OSTROWISESMP-MILKPOWDER', 'Raw Materials', 'kg', 300.0, 0, 600.0, 'OSTROWISE SMP', NULL, NULL, NULL, NULL, NULL, 308.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('MILK POWDER', 'PLEANWHITESMPUNKNOWN-MILKPOWDER', 'Raw Materials', 'kg', 2000.0, 0, 4000.0, 'PLEAN WHITE SMP UNKNOWN', NULL, NULL, NULL, NULL, NULL, 295.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('MILK POWDER', 'SACCHIGWALIORSMP-MILKPOWDER', 'Raw Materials', 'kg', 1750.0, 0, 3500.0, 'SACCHI GWALIOR SMP', NULL, NULL, NULL, NULL, NULL, 318.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('MILK POWDER', 'MAAANJANISMP-MILKPOWDER', 'Raw Materials', 'kg', 3000.0, 0, 6000.0, 'MAA ANJANI SMP', NULL, NULL, NULL, NULL, NULL, 312.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('MILK POWDER', 'ROYALSMP-MILKPOWDER', 'Raw Materials', 'kg', 1250.0, 0, 2500.0, 'ROYAL SMP', NULL, NULL, NULL, NULL, NULL, 325.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('MILK POWDER', 'SANCHIGWALIORSMP-MILKPOWDER', 'Raw Materials', 'kg', 6400.0, 0, 12800.0, 'SANCHI GWALIOR SMP', NULL, NULL, NULL, NULL, NULL, 320.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('MILK POWDER', 'BMPSMPPLAINPACKING-MILKPOWDER', 'Raw Materials', 'kg', 2025.0, 0, 4050.0, 'BMP SMP PLAIN PACKING', NULL, NULL, NULL, NULL, NULL, 300.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('MILK POWDER', 'SANCHIGWALIOR-MILKPOWDER', 'Raw Materials', 'kg', 2100.0, 0, 4200.0, 'SANCHI GWALIOR', NULL, NULL, NULL, NULL, NULL, 318.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('MILK POWDER', 'OSSMP-MILKPOWDER', 'Raw Materials', 'kg', 1825.0, 0, 3650.0, 'OS SMP', NULL, NULL, NULL, NULL, NULL, 308.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('MILK POWDER', 'TOPSMP-MILKPOWDER', 'Raw Materials', 'kg', 375.0, 0, 750.0, 'TOP SMP', NULL, NULL, NULL, NULL, NULL, 315.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('MILK POWDER', 'DELICIASMP-MILKPOWDER', 'Raw Materials', 'kg', 1075.0, 0, 2150.0, 'DELICIA SMP', NULL, NULL, NULL, NULL, NULL, 322.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('MILK POWDER', 'OSSMP-MILKPOWDER', 'Raw Materials', 'kg', 10750.0, 0, 21500.0, 'OS SMP', NULL, NULL, NULL, NULL, NULL, 308.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Nandeshwar Preminum Desert', 'NULL-NANDESHWARPREMINUMDESERT', 'Finished Goods', 'kg', 390.0, 0, 780.0, NULL, NULL, NULL, NULL, NULL, NULL, 450.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Gopal Barfi', 'NULL-GOPALBARFI', 'Finished Goods', 'kg', 900.0, 0, 1800.0, NULL, NULL, NULL, NULL, NULL, NULL, 380.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Nandi Dani', 'NULL-NANDIDANI', 'Finished Goods', 'kg', 150.0, 0, 300.0, NULL, NULL, NULL, NULL, NULL, NULL, 420.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Gopal Halwa', 'NULL-GOPALHALWA', 'Finished Goods', 'kg', 432.0, 0, 864.0, NULL, NULL, NULL, NULL, NULL, NULL, 360.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Nandi Halwa', 'NULL-NANDIHALWA', 'Finished Goods', 'kg', 486.0, 0, 972.0, NULL, NULL, NULL, NULL, NULL, NULL, 400.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Nandi halwa', 'NULL-NANDIHALWA', 'Finished Goods', 'kg', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 400.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Nandi special (5kg)', 'NULL-NANDISPECIAL5KG', 'Finished Goods', 'kg', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 480.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Sweets (mawa mix)', 'NULL-SWEETSMAWAMIX', 'Finished Goods', 'kg', 976.0, 0, 1952.0, NULL, NULL, '488box', NULL, NULL, NULL, 420.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Kaju katri', 'NULL-KAJUKATRI', 'Finished Goods', 'kg', 48.0, 0, 96.0, NULL, NULL, '32box', NULL, NULL, NULL, 950.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Mix dry fruits mithai', 'NULL-MIXDRYFRUITSMITHAI', 'Finished Goods', 'kg', 5.0, 0, 10.0, NULL, NULL, NULL, NULL, NULL, NULL, 850.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Mix bites', 'NULL-MIXBITES', 'Finished Goods', 'kg', 50.0, 0, 100.0, NULL, NULL, '28box', NULL, NULL, NULL, 480.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Gopal burfi (10kg)', 'NULL-GOPALBURFI10KG', 'Finished Goods', 'kg', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 380.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Mithai mawa LSP', 'NULL-MITHAIMAWALSP', 'Finished Goods', 'kg', 1800.0, 0, 3600.0, NULL, NULL, '60bags', NULL, NULL, NULL, 410.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Nandi Indian Desert', 'NULL-NANDIINDIANDESERT', 'Finished Goods', 'kg', 750.0, 0, 1500.0, NULL, NULL, NULL, NULL, NULL, NULL, 440.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'WHITEPLAINLSP-BARFI', 'Finished Goods', 'kg', 630.0, 0, 1260.0, 'WHITE PLAIN LSP', NULL, '21*30', NULL, NULL, NULL, 390.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'BARFIPLAINUNKNOWN-BARFI', 'Finished Goods', 'kg', 450.0, 0, 900.0, 'BARFI PLAIN UNKNOWN', NULL, '15*30', NULL, NULL, NULL, 380.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'GOPALBARFIORMKRETURN-BARFI', 'Finished Goods', 'kg', 180.0, 0, 360.0, 'GOPAL BARFI OR MK RETURN', NULL, '6*30', NULL, NULL, NULL, 380.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'GOPALBARFI-BARFI', 'Finished Goods', 'kg', 810.0, 0, 1620.0, 'GOPAL BARFI', NULL, '27*30', NULL, NULL, NULL, 380.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'BMCHALULOOSE-BARFI', 'Finished Goods', 'kg', 660.0, 0, 1320.0, 'BM CHALU LOOSE', NULL, '22*30', NULL, NULL, NULL, 370.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'LOOSEBM-BARFI', 'Finished Goods', 'kg', 600.0, 0, 1200.0, 'LOOSE BM', NULL, '20*30', NULL, NULL, NULL, 370.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'LALMAWALOOSERTN-BARFI', 'Finished Goods', 'kg', 660.0, 0, 1320.0, 'LAL MAWA LOOSE RTN', NULL, '22*30', NULL, NULL, NULL, 375.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'LOOSEBM-BARFI', 'Finished Goods', 'kg', 1620.0, 0, 3240.0, 'LOOSE BM', NULL, '54*30', NULL, NULL, NULL, 370.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'LOOSEBM2182025-BARFI', 'Finished Goods', 'kg', 720.0, 0, 1440.0, 'LOOSE BM 21/8/2025', NULL, '24*30', NULL, NULL, NULL, 370.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'G.B.GOPAL1582O25-BARFI', 'Finished Goods', 'kg', 1380.0, 0, 2760.0, 'G.B. GOPAL 15/8/2O25', NULL, '46*30', NULL, NULL, NULL, 380.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'N.B.1582025-BARFI', 'Finished Goods', 'kg', 150.0, 0, 300.0, 'N.B. 15/8/2025', NULL, '5*30', NULL, NULL, NULL, 395.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'RTNBM23825103524-BARFI', 'Finished Goods', 'kg', 690.0, 0, 1380.0, 'RTN BM 23/8/25 1035/24', NULL, '23*30', NULL, NULL, NULL, 370.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'GOPAL103630G.B.-BARFI', 'Finished Goods', 'kg', 930.0, 0, 1860.0, 'GOPAL 1036/30 G.B.', NULL, '31*30', NULL, NULL, NULL, 380.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'MMKANTAN-BARFI', 'Finished Goods', 'kg', 690.0, 0, 1380.0, 'MM KANTAN', NULL, '23*30', NULL, NULL, NULL, 385.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'G.B.29825-BARFI', 'Finished Goods', 'kg', 930.0, 0, 1860.0, 'G.B. 29/8/25', NULL, '31*30', NULL, NULL, NULL, 380.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', '1DF91025-BARFI', 'Finished Goods', 'kg', 3000.0, 0, 6000.0, '1 DF 9/10/25', NULL, '100*30', NULL, NULL, NULL, 400.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'IDF-BARFI', 'Finished Goods', 'kg', 330.0, 0, 660.0, 'IDF', NULL, '11*30', NULL, NULL, NULL, 395.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'MM-BARFI', 'Finished Goods', 'kg', 1410.0, 0, 2820.0, 'MM', NULL, '47*30', NULL, NULL, NULL, 385.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'IDF2925-BARFI', 'Finished Goods', 'kg', 1170.0, 0, 2340.0, 'IDF 2/9/25', NULL, '39*30', NULL, NULL, NULL, 395.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'GOPALGB-BARFI', 'Finished Goods', 'kg', 360.0, 0, 720.0, 'GOPAL GB', NULL, '12*30', NULL, NULL, NULL, 380.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'MMMAWA-BARFI', 'Finished Goods', 'kg', 2400.0, 0, 4800.0, 'MM MAWA', NULL, '80*30', NULL, NULL, NULL, 390.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'MM-BARFI', 'Finished Goods', 'kg', 1800.0, 0, 3600.0, 'MM', NULL, '60*30', NULL, NULL, NULL, 385.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'IDFKANTAN-BARFI', 'Finished Goods', 'kg', 1770.0, 0, 3540.0, 'IDF KANTAN', NULL, '59*30', NULL, NULL, NULL, 395.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'GB-BARFI', 'Finished Goods', 'kg', 1110.0, 0, 2220.0, 'GB', NULL, '37*30', NULL, NULL, NULL, 380.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'MM-BARFI', 'Finished Goods', 'kg', 1500.0, 0, 3000.0, 'MM', NULL, '50*30', NULL, NULL, NULL, 385.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'IDF91025-BARFI', 'Finished Goods', 'kg', 2610.0, 0, 5220.0, 'IDF 9/10/25', NULL, '87*30', NULL, NULL, NULL, 395.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'GOPALGB-BARFI', 'Finished Goods', 'kg', 3000.0, 0, 6000.0, 'GOPAL GB', NULL, '100*30', NULL, NULL, NULL, 380.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'MM-BARFI', 'Finished Goods', 'kg', 4800.0, 0, 9600.0, 'MM', NULL, '160*30', NULL, NULL, NULL, 385.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'GB-BARFI', 'Finished Goods', 'kg', 1590.0, 0, 3180.0, 'GB', NULL, '53*30', NULL, NULL, NULL, 380.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'LOOSEBM-BARFI', 'Finished Goods', 'kg', 540.0, 0, 1080.0, 'LOOSE BM', NULL, '18*30', NULL, NULL, NULL, 370.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'IDF-BARFI', 'Finished Goods', 'kg', 600.0, 0, 1200.0, 'IDF', NULL, '20*30', NULL, NULL, NULL, 395.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'IDF-BARFI', 'Finished Goods', 'kg', 1560.0, 0, 3120.0, 'IDF', NULL, '52*30', NULL, NULL, NULL, 395.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'GB-BARFI', 'Finished Goods', 'kg', 1800.0, 0, 3600.0, 'GB', NULL, '60*30', NULL, NULL, NULL, 380.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI(EXPIRED)', 'TT1BAG10KG-BARFIEXPIRED', 'Finished Goods', 'kg', 1170.0, 0, 2340.0, 'TT-1BAG-10KG', NULL, '39*30', NULL, NULL, NULL, 250.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI(EXPIRED)', 'TT-BARFIEXPIRED', 'Finished Goods', 'kg', 480.0, 0, 960.0, 'TT', NULL, '16*30', NULL, NULL, NULL, 250.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI(EXPIRED)', 'ID17-BARFIEXPIRED', 'Finished Goods', 'kg', 510.0, 0, 1020.0, 'ID-17', NULL, '17*30', NULL, NULL, NULL, 250.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI(EXPIRED)', 'MB62-BARFIEXPIRED', 'Finished Goods', 'kg', 1110.0, 0, 2220.0, 'MB/62', NULL, '37*30', NULL, NULL, NULL, 250.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('MITHAI MIX(EXPIRED)', 'NULL-MITHAIMIXEXPIRED', 'Finished Goods', 'kg', 150.0, 0, 300.0, NULL, NULL, '10*15', NULL, NULL, NULL, 280.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI(EXPIRED)', 'MATHURA-BARFIEXPIRED', 'Finished Goods', 'kg', 90.0, 0, 180.0, 'MATHURA', NULL, '3*30', NULL, NULL, NULL, 250.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI (VERY OLD STOCK)', 'LSPNANDI-BARFIVERYOLDSTOCK', 'Finished Goods', 'kg', 660.0, 0, 1320.0, 'LSP NANDI', NULL, '22*30', NULL, NULL, NULL, 280.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI (VERY OLD STOCK)', 'NANDIID-BARFIVERYOLDSTOCK', 'Finished Goods', 'kg', 1500.0, 0, 3000.0, 'NANDI ID', NULL, '50*30', NULL, NULL, NULL, 280.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Tranparent tray 3-liner Vertical', 'NULL-TRANPARENTTRAY3LINERVERTICAL', 'Packing Materials', 'Nos', 2500.0, 0, 5000.0, NULL, NULL, NULL, NULL, NULL, NULL, 8.50)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Transparent tray without plain', 'NULL-TRANSPARENTTRAYWITHOUTPLAIN', 'Packing Materials', 'Nos', 1500.0, 0, 3000.0, NULL, NULL, NULL, NULL, NULL, NULL, 7.50)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Nandi Dani bag(30kg)', 'NULL-NANDIDANIBAG30KG', 'Packing Materials', 'Nos', 7000.0, 0, 14000.0, NULL, NULL, '14bundle*500PCS', NULL, NULL, NULL, 4.50)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Nandi Dani bag (10kg)', 'NULL-NANDIDANIBAG10KG', 'Packing Materials', 'Nos', 9200.0, 0, 18400.0, NULL, NULL, '23bundle*400PCS', NULL, NULL, NULL, 3.20)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Nandi indian dessert bag (30kg) New', 'NULL-NANDIINDIANDESSERTBAG30KGNEW', 'Packing Materials', 'Nos', 6500.0, 0, 13000.0, NULL, NULL, '13bundle*500PCS', NULL, NULL, NULL, 4.80)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Nandeshwar premimum dessert bag 30kg', 'NULL-NANDESHWARPREMIMUMDESSERTBAG30KG', 'Packing Materials', 'Nos', 4000.0, 0, 8000.0, NULL, NULL, '8bundle*500PCS', NULL, NULL, NULL, 4.80)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Gopal Burfi bag (30kg)', 'NULL-GOPALBURFIBAG30KG', 'Packing Materials', 'Nos', 1500.0, 0, 3000.0, NULL, NULL, '3bundle*500PCS', NULL, NULL, NULL, 4.50)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('1kg Kaju Katri Tray barrier four liner', 'NULL-1KGKAJUKATRITRAYBARRIERFOURLINER', 'Packing Materials', 'Nos', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 12.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('2kg 3 liner barrier tray(horizontal)', 'NULL-2KG3LINERBARRIERTRAYHORIZONTAL', 'Packing Materials', 'Nos', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 10.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Nandi halwa empty cartons', 'NULL-NANDIHALWAEMPTYCARTONS', 'Packing Materials', 'Nos', 1680.0, 0, 3360.0, NULL, NULL, '168*10', NULL, NULL, NULL, 18.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Nandi halwa empty cartons', 'NULL-NANDIHALWAEMPTYCARTONS', 'Packing Materials', 'Nos', 1025.0, 0, 2050.0, NULL, NULL, '205*5', NULL, NULL, NULL, 18.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Nandeshwar halwa empty cartons', 'NULL-NANDESHWARHALWAEMPTYCARTONS', 'Packing Materials', 'Nos', 320.0, 0, 640.0, NULL, NULL, '32*10', NULL, NULL, NULL, 20.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Gopal Halwa empty cartons', 'NULL-GOPALHALWAEMPTYCARTONS', 'Packing Materials', 'Nos', 430.0, 0, 860.0, NULL, NULL, '43*10', NULL, NULL, NULL, 18.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Plain mithai cartons', 'NULL-PLAINMITHAICARTONS', 'Packing Materials', 'Nos', 1450.0, 0, 2900.0, NULL, NULL, '145*10', NULL, NULL, NULL, 15.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Tray 3Line White Katri(vertical)', 'NULL-TRAY3LINEWHITEKATRIVERTICAL', 'Packing Materials', 'Nos', 405.0, 0, 810.0, NULL, NULL, NULL, NULL, NULL, NULL, 9.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Top barrier roll(560mm)', 'NULL-TOPBARRIERROLL560MM', 'Packing Materials', 'Nos', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 450.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Top barrier roll(420mm)', 'NULL-TOPBARRIERROLL420MM', 'Packing Materials', 'Nos', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 380.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Top barrier roll (375mm)', 'NULL-TOPBARRIERROLL375MM', 'Packing Materials', 'Nos', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 350.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Packing strip for cartons', 'NULL-PACKINGSTRIPFORCARTONS', 'Packing Materials', 'Nos', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 120.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Nandeshwar premimum dessert bag 30kg', 'NULL-NANDESHWARPREMIMUMDESSERTBAG30KG', 'Packing Materials', 'Nos', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 4.80)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Clinges wrapping rolls', 'NULL-CLINGESWRAPPINGROLLS', 'Packing Materials', 'Nos', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 280.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('3kg halwa empty box', 'NULL-3KGHALWAEMPTYBOX', 'Packing Materials', 'Nos', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 22.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Special nandi empty cartoons (30kg)', 'NULL-SPECIALNANDIEMPTYCARTOONS30KG', 'Packing Materials', 'Nos', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 25.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Special nandi empty cartoons (10kg)', 'NULL-SPECIALNANDIEMPTYCARTOONS10KG', 'Packing Materials', 'Nos', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 18.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Old carton laddu', 'NULL-OLDCARTONLADDU', 'Packing Materials', 'Nos', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 12.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Kaju katri empty cartoons', 'NULL-KAJUKATRIEMPTYCARTOONS', 'Packing Materials', 'Nos', 400.0, 0, 800.0, NULL, NULL, NULL, NULL, NULL, NULL, 20.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('500gm sweets box plastic', 'NULL-500GMSWEETSBOXPLASTIC', 'Packing Materials', 'Nos', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 8.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('250gm sweets box plastic', 'NULL-250GMSWEETSBOXPLASTIC', 'Packing Materials', 'Nos', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 5.50)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Nandi indian dessert bag (10kg) (red)', 'NULL-NANDIINDIANDESSERTBAG10KGRED', 'Packing Materials', 'Nos', 2000.0, 0, 4000.0, NULL, NULL, '5*400', NULL, NULL, NULL, 3.50)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Nandi indian dessert bag (10kg) old design', 'NULL-NANDIINDIANDESSERTBAG10KGOLDDESIGN', 'Packing Materials', 'Nos', 3000.0, 0, 6000.0, NULL, NULL, '25*400+10*200', NULL, NULL, NULL, 3.20)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Nandi indian dessert bag(30kg) old design', 'NULL-NANDIINDIANDESSERTBAG30KGOLDDESIGN', 'Packing Materials', 'Nos', 4000.0, 0, 8000.0, NULL, NULL, '10*400', NULL, NULL, NULL, 4.50)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Cartoons tap rolls', 'NULL-CARTOONSTAPROLLS', 'Packing Materials', 'Nos', 900.0, 0, 1800.0, NULL, NULL, NULL, NULL, NULL, NULL, 85.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Gopal panni 3kg', 'NULL-GOPALPANNI3KG', 'Packing Materials', 'Nos', 20000.0, 0, 40000.0, NULL, NULL, '4*5000', NULL, NULL, NULL, 0.80)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Nandi panni 3kg', 'NULL-NANDIPANNI3KG', 'Packing Materials', 'Nos', 25000.0, 0, 50000.0, NULL, NULL, '5*5000', NULL, NULL, NULL, 0.85)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Nandeshwar panni 3kg', 'NULL-NANDESHWARPANNI3KG', 'Packing Materials', 'Nos', 25000.0, 0, 50000.0, NULL, NULL, '5*5000', NULL, NULL, NULL, 0.85)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Nandeshwar 10kg plain panni', 'NULL-NANDESHWAR10KGPLAINPANNI', 'Packing Materials', 'Nos', 8800.0, 0, 17600.0, NULL, NULL, '22*400', NULL, NULL, NULL, 2.50)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('3kg plastic container', 'NULL-3KGPLASTICCONTAINER', 'Packing Materials', 'Nos', 6930.0, 0, 13860.0, NULL, NULL, '27*90', NULL, NULL, NULL, 18.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('3kg plastic lid', 'NULL-3KGPLASTICLID', 'Packing Materials', 'Nos', 6930.0, 0, 13860.0, NULL, NULL, '27*90', NULL, NULL, NULL, 8.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Transparent riboon film (Sticker print rolls)', 'NULL-TRANSPARENTRIBOONFILMSTICKERPRINTROLLS', 'Packing Materials', 'Nos', 0, 0, 100, NULL, NULL, NULL, NULL, NULL, NULL, 320.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('Cello tapes', 'NULL-CELLOTAPES', 'Packing Materials', 'Nos', 96.0, 0, 192.0, NULL, NULL, '12*8', NULL, NULL, NULL, 35.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('5KG vacuum tray(UNUSED)', 'BMWHITEPLASTICRETURNORLOOSE-5KGVACUUMTRAYUNUSED', 'Packing Materials', 'Nos', 3250.0, 0, 6500.0, 'BM WHITE PLASTIC RETURN OR LOOSE', NULL, NULL, NULL, NULL, NULL, 15.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'MMBARFILSP-BARFI', 'Packing Materials', 'Nos', 270.0, 0, 540.0, 'MM BARFI LSP', NULL, NULL, NULL, NULL, NULL, 12.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'LOOSEBMPLASTIC-BARFI', 'Packing Materials', 'Nos', 3090.0, 0, 6180.0, 'LOOSE BM PLASTIC', NULL, NULL, NULL, NULL, NULL, 10.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, brand, grade, packing_weight, category_type, packing_qty, factory, cost_per_unit)
VALUES ('BARFI', 'NULL-BARFI', 'Packing Materials', 'Nos', 600.0, 0, 1200.0, NULL, NULL, NULL, NULL, NULL, NULL, 10.00)
ON CONFLICT (sku) DO NOTHING;