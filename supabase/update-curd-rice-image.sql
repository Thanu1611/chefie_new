-- Run in Supabase SQL editor to fix Curd Rice photos in an existing database.
UPDATE dishes
SET image_url = '/dishes/curd-rice.jpg'
WHERE lower(dish_name) LIKE '%curd rice%'
   OR lower(dish_name) LIKE '%thayir%'
   OR lower(dish_name) LIKE '%yogurt rice%';
