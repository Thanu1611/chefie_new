-- Supabase SQL Editor: paste and Run once

DROP TABLE IF EXISTS dish_steps CASCADE;
DROP TABLE IF EXISTS dishes CASCADE;
DROP TABLE IF EXISTS cuisines CASCADE;
DROP TABLE IF EXISTS saved_dishes CASCADE;

CREATE TABLE cuisines (
  cuisine_id text PRIMARY KEY,
  cuisine_name text NOT NULL,
  image_url text NOT NULL,
  short_description text NOT NULL
);
CREATE TABLE dishes (
  dish_id text PRIMARY KEY,
  cuisine_id text NOT NULL REFERENCES cuisines(cuisine_id) ON DELETE CASCADE,
  dish_name text NOT NULL,
  description text NOT NULL,
  meal_type text NOT NULL,
  dish_type text NOT NULL,
  image_url text NOT NULL,
  prep_time integer NOT NULL,
  cooking_time integer NOT NULL,
  ingredients text NOT NULL
);
CREATE TABLE dish_steps (
  step_id serial PRIMARY KEY,
  dish_id text NOT NULL REFERENCES dishes(dish_id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  title text NOT NULL,
  instruction text NOT NULL,
  break_time_minutes integer NOT NULL DEFAULT 0,
  timer_required boolean NOT NULL DEFAULT false,
  timer_minutes integer
);
CREATE TABLE saved_dishes (
  id serial PRIMARY KEY,
  dish_id text NOT NULL,
  saved_at timestamptz NOT NULL DEFAULT now()
);

DROP POLICY IF EXISTS cuisines_read ON cuisines;
DROP POLICY IF EXISTS dishes_read ON dishes;
DROP POLICY IF EXISTS dish_steps_read ON dish_steps;
DROP POLICY IF EXISTS cuisines_insert ON cuisines;
DROP POLICY IF EXISTS dishes_insert ON dishes;
DROP POLICY IF EXISTS dish_steps_insert ON dish_steps;
DROP POLICY IF EXISTS cuisines_delete ON cuisines;
DROP POLICY IF EXISTS dishes_delete ON dishes;
DROP POLICY IF EXISTS dish_steps_delete ON dish_steps;

ALTER TABLE cuisines ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dish_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY cuisines_read ON cuisines FOR SELECT TO anon, authenticated, service_role USING (true);
CREATE POLICY dishes_read ON dishes FOR SELECT TO anon, authenticated, service_role USING (true);
CREATE POLICY dish_steps_read ON dish_steps FOR SELECT USING (true);
CREATE POLICY cuisines_insert ON cuisines FOR INSERT WITH CHECK (true);
CREATE POLICY dishes_insert ON dishes FOR INSERT WITH CHECK (true);
CREATE POLICY dish_steps_insert ON dish_steps FOR INSERT WITH CHECK (true);
CREATE POLICY cuisines_delete ON cuisines FOR DELETE USING (true);
CREATE POLICY dishes_delete ON dishes FOR DELETE USING (true);
CREATE POLICY dish_steps_delete ON dish_steps FOR DELETE USING (true);

INSERT INTO cuisines VALUES ('chinese','Chinese','https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80','Wok-fired classics, dim sum, and comforting noodle bowls.');
INSERT INTO cuisines VALUES ('sri_lankan','Sri Lankan','https://images.unsplash.com/photo-1604908176997-43162f4d978e?w=800&q=80','Island curries, hoppers, and bold sambols with coconut warmth.');
INSERT INTO cuisines VALUES ('indian','Indian','https://images.unsplash.com/photo-1585937421612-70a008592f82?w=800&q=80','Aromatic spices, biryanis, dals, and tandoor favorites.');
INSERT INTO dishes VALUES ('chinese-breakfast-veg-1-congee-with-greens','chinese','Congee with Greens','Silky rice porridge topped with ginger, soy, and fresh bok choy.','Breakfast','Veg','https://images.unsplash.com/photo-1585937421612-70a008592f82?w=800&q=80',10,35,'["jasmine rice","chicken or vegetable broth","bok choy","fresh ginger","soy sauce","white pepper","sesame oil"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-breakfast-veg-1-congee-with-greens',1,'Rinse rice','Rinse jasmine rice until water runs clear.',0,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-breakfast-veg-1-congee-with-greens',2,'Simmer','Simmer rice in broth, stirring often, until creamy.',0,true,30);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-breakfast-veg-1-congee-with-greens',3,'Blanch greens','Blanch bok choy for 1 minute and drain.',0,true,1);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-breakfast-veg-1-congee-with-greens',4,'Season','Stir in ginger, white pepper, and a splash of soy sauce.',2,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-breakfast-veg-1-congee-with-greens',5,'Serve','Ladle into bowls and top with greens and sesame oil.',0,false,NULL);
INSERT INTO dishes VALUES ('chinese-breakfast-veg-2-steamed-vegetable-buns','chinese','Steamed Vegetable Buns','Soft mantou filled with seasoned cabbage and mushrooms.','Breakfast','Veg','https://images.unsplash.com/photo-1496116218417-697325aee646?w=800&q=80',25,20,'["mantou dough","napa cabbage","carrots","shiitake mushrooms","soy sauce","sesame oil"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-breakfast-veg-2-steamed-vegetable-buns',1,'Make filling','Sauté cabbage, carrots, and mushrooms with soy and sesame oil.',0,true,8);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-breakfast-veg-2-steamed-vegetable-buns',2,'Shape buns','Wrap filling in dough rounds and pinch tops closed.',10,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-breakfast-veg-2-steamed-vegetable-buns',3,'Proof','Rest buns until slightly puffy.',0,true,15);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-breakfast-veg-2-steamed-vegetable-buns',4,'Steam','Steam on parchment until fluffy and cooked through.',0,true,12);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-breakfast-veg-2-steamed-vegetable-buns',5,'Serve hot','Serve immediately with chili oil on the side.',0,false,NULL);
INSERT INTO dishes VALUES ('chinese-breakfast-non-veg-1-egg-jianbing','chinese','Egg Jianbing','Crispy crepe with egg, scallions, and savory sauce.','Breakfast','Non-Veg','https://images.unsplash.com/photo-1529042416850-9bc9d91a63f3?w=800&q=80',15,12,'["mung bean flour","eggs","scallions","savory sauce","crispy cracker"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-breakfast-non-veg-1-egg-jianbing',1,'Mix batter','Whisk mung bean flour batter until smooth.',5,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-breakfast-non-veg-1-egg-jianbing',2,'Cook crepe','Spread batter on hot griddle and cook until set.',0,true,3);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-breakfast-non-veg-1-egg-jianbing',3,'Add egg','Crack egg over crepe and spread evenly.',0,true,2);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-breakfast-non-veg-1-egg-jianbing',4,'Fold','Add sauce, crackers, and fold into a parcel.',1,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-breakfast-non-veg-1-egg-jianbing',5,'Serve','Cut in half and serve warm.',0,false,NULL);
INSERT INTO dishes VALUES ('chinese-breakfast-non-veg-2-chicken-congee','chinese','Chicken Congee','Comforting chicken rice porridge with ginger and spring onion.','Breakfast','Non-Veg','https://images.unsplash.com/photo-1604908176997-43162f4d978e?w=800&q=80',15,40,'["jasmine rice","chicken breast","ginger","spring onion","broth","white pepper"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-breakfast-non-veg-2-chicken-congee',1,'Poach chicken','Poach chicken breast with ginger until just cooked.',0,true,15);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-breakfast-non-veg-2-chicken-congee',2,'Shred','Shred chicken and reserve warm broth.',5,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-breakfast-non-veg-2-chicken-congee',3,'Cook congee','Simmer rice in broth until thick and silky.',0,true,25);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-breakfast-non-veg-2-chicken-congee',4,'Combine','Stir shredded chicken back into congee.',2,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-breakfast-non-veg-2-chicken-congee',5,'Garnish','Top with spring onion and white pepper.',0,false,NULL);
INSERT INTO dishes VALUES ('chinese-lunch-veg-1-mapo-tofu-vegetarian','chinese','Mapo Tofu (Vegetarian)','Silken tofu in spicy bean sauce with Sichuan pepper.','Lunch','Veg','https://images.unsplash.com/photo-1525755662778-989dbe24aef7?w=800&q=80',15,20,'["silken tofu","doubanjiang","Sichuan peppercorn","garlic","ginger","vegetable stock"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-lunch-veg-1-mapo-tofu-vegetarian',1,'Prep tofu','Cut tofu into cubes and blanch gently.',0,true,2);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-lunch-veg-1-mapo-tofu-vegetarian',2,'Fry aromatics','Fry garlic, ginger, and doubanjiang until fragrant.',0,true,3);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-lunch-veg-1-mapo-tofu-vegetarian',3,'Simmer','Add stock and simmer sauce.',0,true,5);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-lunch-veg-1-mapo-tofu-vegetarian',4,'Add tofu','Slide in tofu and simmer without breaking.',0,true,8);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-lunch-veg-1-mapo-tofu-vegetarian',5,'Finish','Thicken, add peppercorn oil, and garnish with scallions.',0,false,NULL);
INSERT INTO dishes VALUES ('chinese-lunch-veg-2-vegetable-fried-rice','chinese','Vegetable Fried Rice','Wok-tossed rice with peas, carrots, and soy aroma.','Lunch','Veg','https://images.unsplash.com/photo-1603139819008-e49cbeb0a889?w=800&q=80',10,15,'["day-old rice","peas","carrots","soy sauce","sesame oil"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-lunch-veg-2-vegetable-fried-rice',1,'Prep rice','Use day-old cold rice for best texture.',0,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-lunch-veg-2-vegetable-fried-rice',2,'Stir-fry veg','High heat stir-fry carrots and peas.',0,true,3);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-lunch-veg-2-vegetable-fried-rice',3,'Toast rice','Add rice and toss until grains separate.',0,true,5);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-lunch-veg-2-vegetable-fried-rice',4,'Season','Add soy sauce and sesame oil off heat.',1,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-lunch-veg-2-vegetable-fried-rice',5,'Serve','Serve immediately from the wok.',0,false,NULL);
INSERT INTO dishes VALUES ('chinese-lunch-non-veg-1-kung-pao-chicken','chinese','Kung Pao Chicken','Stir-fried chicken with peanuts and dried chilies.','Lunch','Non-Veg','https://images.unsplash.com/photo-1603894584371-6a46dc30ff6b?w=800&q=80',20,25,'["chicken thigh","peanuts","dried chilies","Sichuan pepper","soy sauce","rice vinegar"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-lunch-non-veg-1-kung-pao-chicken',1,'Marinate','Marinate diced chicken with soy and cornstarch.',0,true,15);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-lunch-non-veg-1-kung-pao-chicken',2,'Fry chilies','Fry dried chilies and Sichuan pepper until aromatic.',0,true,2);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-lunch-non-veg-1-kung-pao-chicken',3,'Cook chicken','Stir-fry chicken until golden.',0,true,6);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-lunch-non-veg-1-kung-pao-chicken',4,'Add sauce','Pour in vinegar-soy sauce and toss.',0,true,3);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-lunch-non-veg-1-kung-pao-chicken',5,'Finish','Add roasted peanuts and serve with rice.',0,false,NULL);
INSERT INTO dishes VALUES ('chinese-lunch-non-veg-2-sweet-and-sour-pork','chinese','Sweet and Sour Pork','Crispy pork bites in tangy bell pepper sauce.','Lunch','Non-Veg','https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=80',20,30,'["pork shoulder","cornstarch","bell peppers","pineapple","vinegar","ketchup","sugar"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-lunch-non-veg-2-sweet-and-sour-pork',1,'Coat pork','Toss pork pieces in seasoned cornstarch.',5,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-lunch-non-veg-2-sweet-and-sour-pork',2,'Fry','Deep fry until golden and crisp.',0,true,8);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-lunch-non-veg-2-sweet-and-sour-pork',3,'Make sauce','Simmer vinegar, sugar, ketchup, and pineapple juice.',0,true,6);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-lunch-non-veg-2-sweet-and-sour-pork',4,'Combine','Toss pork with peppers and sauce.',0,true,3);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-lunch-non-veg-2-sweet-and-sour-pork',5,'Serve','Serve hot over steamed rice.',0,false,NULL);
INSERT INTO dishes VALUES ('chinese-dinner-veg-1-buddha-s-delight','chinese','Buddha''s Delight','Mixed vegetables and tofu braised in light soy broth.','Dinner','Veg','https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',20,25,'["tofu","shiitake mushrooms","baby corn","snow peas","light soy","vegetable broth"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-dinner-veg-1-buddha-s-delight',1,'Soak mushrooms','Rehydrate shiitake in warm water.',0,true,20);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-dinner-veg-1-buddha-s-delight',2,'Stir-fry','Stir-fry tofu and vegetables separately.',0,true,8);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-dinner-veg-1-buddha-s-delight',3,'Braise','Combine with broth and simmer gently.',0,true,12);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-dinner-veg-1-buddha-s-delight',4,'Thicken','Add cornstarch slurry to gloss the sauce.',0,true,2);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-dinner-veg-1-buddha-s-delight',5,'Serve','Garnish with sesame and serve family style.',0,false,NULL);
INSERT INTO dishes VALUES ('chinese-dinner-veg-2-dan-dan-noodles-veg','chinese','Dan Dan Noodles (Veg)','Noodles with spicy sesame sauce and preserved vegetables.','Dinner','Veg','https://images.unsplash.com/photo-1569714482467-e28fb53a82af?w=800&q=80',15,15,'["wheat noodles","tahini","chili oil","soy sauce","rice vinegar","pickled mustard greens","peanuts"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-dinner-veg-2-dan-dan-noodles-veg',1,'Make sauce','Whisk chili oil, tahini, soy, and vinegar.',0,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-dinner-veg-2-dan-dan-noodles-veg',2,'Cook noodles','Boil wheat noodles until al dente.',0,true,6);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-dinner-veg-2-dan-dan-noodles-veg',3,'Prep toppings','Pan-fry mushrooms and pickled mustard greens.',0,true,5);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-dinner-veg-2-dan-dan-noodles-veg',4,'Assemble','Toss noodles with sauce and toppings.',1,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-dinner-veg-2-dan-dan-noodles-veg',5,'Serve','Top with crushed peanuts and scallions.',0,false,NULL);
INSERT INTO dishes VALUES ('chinese-dinner-non-veg-1-peking-duck-pancakes','chinese','Peking Duck Pancakes','Crispy duck skin served with pancakes and hoisin.','Dinner','Non-Veg','https://images.unsplash.com/photo-1518495976271-974dc5e82205?w=800&q=80',30,90,'["whole duck","hoisin sauce","mandarin pancakes","cucumber","spring onion"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-dinner-non-veg-1-peking-duck-pancakes',1,'Dry duck','Air-dry seasoned duck skin until taut.',0,true,60);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-dinner-non-veg-1-peking-duck-pancakes',2,'Roast','Roast at high heat until skin is lacquered.',0,true,45);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-dinner-non-veg-1-peking-duck-pancakes',3,'Rest','Rest duck before carving.',0,true,15);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-dinner-non-veg-1-peking-duck-pancakes',4,'Carve','Slice skin and meat for wrapping.',5,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-dinner-non-veg-1-peking-duck-pancakes',5,'Serve','Serve with pancakes, cucumber, and hoisin.',0,false,NULL);
INSERT INTO dishes VALUES ('chinese-dinner-non-veg-2-steamed-whole-fish','chinese','Steamed Whole Fish','Ginger-scallion fish steamed until silky and tender.','Dinner','Non-Veg','https://images.unsplash.com/photo-1519708227418-c8fd9a91b2c8?w=800&q=80',15,20,'["whole white fish","ginger","scallions","soy sauce","hot oil"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-dinner-non-veg-2-steamed-whole-fish',1,'Prep fish','Score fish and stuff with ginger slices.',5,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-dinner-non-veg-2-steamed-whole-fish',2,'Steam','Steam on high until flesh flakes.',0,true,12);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-dinner-non-veg-2-steamed-whole-fish',3,'Make oil','Heat oil with scallions until fragrant.',0,true,2);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-dinner-non-veg-2-steamed-whole-fish',4,'Dress','Pour hot oil and soy over fish.',1,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('chinese-dinner-non-veg-2-steamed-whole-fish',5,'Serve','Serve immediately with rice.',0,false,NULL);
INSERT INTO dishes VALUES ('sri_lankan-breakfast-veg-1-string-hoppers-with-sambol','sri_lankan','String Hoppers with Sambol','Steamed rice noodle nests with coconut and chili sambol.','Breakfast','Veg','https://images.unsplash.com/photo-1589302168068-964664a07101?w=800&q=80',20,25,'["rice flour","coconut milk","grated coconut","red chili","lime"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-breakfast-veg-1-string-hoppers-with-sambol',1,'Mix batter','Combine rice flour and coconut milk to a thick batter.',5,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-breakfast-veg-1-string-hoppers-with-sambol',2,'Press noodles','Press batter into hopper molds.',10,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-breakfast-veg-1-string-hoppers-with-sambol',3,'Steam','Steam until firm and glossy.',0,true,8);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-breakfast-veg-1-string-hoppers-with-sambol',4,'Make sambol','Grind coconut, chili, and lime for sambol.',5,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-breakfast-veg-1-string-hoppers-with-sambol',5,'Serve','Serve hoppers warm with sambol on the side.',0,false,NULL);
INSERT INTO dishes VALUES ('sri_lankan-breakfast-veg-2-coconut-roti','sri_lankan','Coconut Roti','Pan-fried coconut flatbread served with lunu miris.','Breakfast','Veg','https://images.unsplash.com/photo-1626073833769-9a477b1a7621?w=800&q=80',15,20,'["wheat flour","grated coconut","water","salt","lunu miris"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-breakfast-veg-2-coconut-roti',1,'Knead dough','Knead flour, coconut, and water until soft.',10,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-breakfast-veg-2-coconut-roti',2,'Rest','Cover and rest dough.',0,true,15);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-breakfast-veg-2-coconut-roti',3,'Shape','Divide and roll into thick rounds.',5,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-breakfast-veg-2-coconut-roti',4,'Cook','Pan-fry until golden spots appear.',0,true,12);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-breakfast-veg-2-coconut-roti',5,'Serve','Serve with lunu miris and tea.',0,false,NULL);
INSERT INTO dishes VALUES ('sri_lankan-breakfast-non-veg-1-egg-hoppers','sri_lankan','Egg Hoppers','Bowl-shaped crepes with a soft egg center.','Breakfast','Non-Veg','https://images.unsplash.com/photo-1604908176997-43162f4d978e?w=800&q=80',30,20,'["fermented rice batter","eggs","coconut oil","sambol"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-breakfast-non-veg-1-egg-hoppers',1,'Ferment batter','Rest fermented rice batter until bubbly.',0,true,120);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-breakfast-non-veg-1-egg-hoppers',2,'Heat pan','Heat hopper pan with a swirl of oil.',0,true,3);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-breakfast-non-veg-1-egg-hoppers',3,'Swirl batter','Coat sides thinly and crack egg in center.',0,true,4);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-breakfast-non-veg-1-egg-hoppers',4,'Cover','Cover and cook until egg sets.',0,true,4);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-breakfast-non-veg-1-egg-hoppers',5,'Serve','Serve with sambol and curry on the side.',0,false,NULL);
INSERT INTO dishes VALUES ('sri_lankan-breakfast-non-veg-2-fish-cutlets','sri_lankan','Fish Cutlets','Spiced fish potato croquettes fried until crisp.','Breakfast','Non-Veg','https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',25,20,'["white fish","potato","curry leaves","breadcrumbs","onion","spices"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-breakfast-non-veg-2-fish-cutlets',1,'Cook fish','Poach fish with curry leaves and flake.',0,true,10);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-breakfast-non-veg-2-fish-cutlets',2,'Mix filling','Combine fish, potato, and spices.',10,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-breakfast-non-veg-2-fish-cutlets',3,'Shape','Form ovals and coat in breadcrumbs.',10,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-breakfast-non-veg-2-fish-cutlets',4,'Chill','Chill cutlets to hold shape.',0,true,20);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-breakfast-non-veg-2-fish-cutlets',5,'Fry','Deep fry until golden brown.',0,true,6);
INSERT INTO dishes VALUES ('sri_lankan-lunch-veg-1-dhal-curry','sri_lankan','Dhal Curry','Red lentils simmered with coconut milk and curry leaves.','Lunch','Veg','https://images.unsplash.com/photo-1585937421612-70a008592f82?w=800&q=80',10,30,'["red lentils","turmeric","coconut milk","mustard seeds","curry leaves","onion"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-lunch-veg-1-dhal-curry',1,'Rinse lentils','Wash red lentils until water is clear.',0,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-lunch-veg-1-dhal-curry',2,'Simmer','Simmer lentils with turmeric until soft.',0,true,20);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-lunch-veg-1-dhal-curry',3,'Temper','Fry mustard seeds, curry leaves, and onion.',0,true,5);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-lunch-veg-1-dhal-curry',4,'Combine','Stir tempered spices and coconut milk into dal.',0,true,5);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-lunch-veg-1-dhal-curry',5,'Serve','Serve with rice and mallung.',0,false,NULL);
INSERT INTO dishes VALUES ('sri_lankan-lunch-veg-2-jackfruit-mallung','sri_lankan','Jackfruit Mallung','Stir-fried young jackfruit with coconut and lime.','Lunch','Veg','https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',15,20,'["young jackfruit","grated coconut","green chili","lime"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-lunch-veg-2-jackfruit-mallung',1,'Prep jackfruit','Boil young jackfruit until tender.',0,true,15);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-lunch-veg-2-jackfruit-mallung',2,'Shred','Shred jackfruit and drain well.',3,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-lunch-veg-2-jackfruit-mallung',3,'Stir-fry','Toss with grated coconut and green chili.',0,true,6);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-lunch-veg-2-jackfruit-mallung',4,'Season','Finish with lime juice and salt.',1,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-lunch-veg-2-jackfruit-mallung',5,'Serve','Serve warm as a side with rice.',0,false,NULL);
INSERT INTO dishes VALUES ('sri_lankan-lunch-non-veg-1-chicken-curry','sri_lankan','Chicken Curry','Dark roasted Sri Lankan chicken curry with coconut.','Lunch','Non-Veg','https://images.unsplash.com/photo-1603894584371-6a46dc30ff6b?w=800&q=80',20,45,'["chicken pieces","Sri Lankan curry powder","onion","thin coconut milk","thick coconut milk"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-lunch-non-veg-1-chicken-curry',1,'Roast spices','Dry roast curry powder with onion.',0,true,8);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-lunch-non-veg-1-chicken-curry',2,'Brown chicken','Brown chicken pieces in the pan.',0,true,10);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-lunch-non-veg-1-chicken-curry',3,'Simmer','Add thin coconut milk and simmer covered.',0,true,20);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-lunch-non-veg-1-chicken-curry',4,'Thicken','Add thick coconut milk and reduce.',0,true,10);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-lunch-non-veg-1-chicken-curry',5,'Serve','Serve with rice and pol sambol.',0,false,NULL);
INSERT INTO dishes VALUES ('sri_lankan-lunch-non-veg-2-fish-ambul-thiyal','sri_lankan','Fish Ambul Thiyal','Sour black pepper fish curry from the southern coast.','Lunch','Non-Veg','https://images.unsplash.com/photo-1519708227418-c8fd9a91b2c8?w=800&q=80',15,35,'["tuna steaks","goraka","black pepper","spice paste"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-lunch-non-veg-2-fish-ambul-thiyal',1,'Make paste','Simmer goraka, pepper, and spices into a paste.',0,true,10);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-lunch-non-veg-2-fish-ambul-thiyal',2,'Add fish','Nestle tuna steaks into the paste.',5,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-lunch-non-veg-2-fish-ambul-thiyal',3,'Cook gently','Cook on low without stirring much.',0,true,15);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-lunch-non-veg-2-fish-ambul-thiyal',4,'Reduce','Reduce until gravy coats the fish.',0,true,8);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-lunch-non-veg-2-fish-ambul-thiyal',5,'Serve','Serve at room temperature with rice.',0,false,NULL);
INSERT INTO dishes VALUES ('sri_lankan-dinner-veg-1-wambatu-moju','sri_lankan','Wambatu Moju','Sweet-sour caramelized eggplant pickle served warm.','Dinner','Veg','https://images.unsplash.com/photo-1625944525533-473f1a3d54e0?w=800&q=80',15,30,'["eggplant","sugar","vinegar","spices"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-dinner-veg-1-wambatu-moju',1,'Fry eggplant','Shallow fry eggplant until golden.',0,true,12);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-dinner-veg-1-wambatu-moju',2,'Caramelize','Cook sugar, vinegar, and spices to a glaze.',0,true,8);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-dinner-veg-1-wambatu-moju',3,'Combine','Toss eggplant in the sweet-sour glaze.',0,true,5);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-dinner-veg-1-wambatu-moju',4,'Rest','Rest flavors together.',0,true,5);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-dinner-veg-1-wambatu-moju',5,'Serve','Serve with rice and papadam.',0,false,NULL);
INSERT INTO dishes VALUES ('sri_lankan-dinner-veg-2-gotu-kola-mallung','sri_lankan','Gotu Kola Mallung','Fresh gotu kola leaves tossed with coconut and lime.','Dinner','Veg','https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',10,8,'["gotu kola leaves","grated coconut","onion","green chili","lime"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-dinner-veg-2-gotu-kola-mallung',1,'Wash leaves','Wash and finely chop gotu kola.',5,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-dinner-veg-2-gotu-kola-mallung',2,'Toast coconut','Lightly toast grated coconut.',0,true,3);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-dinner-veg-2-gotu-kola-mallung',3,'Mix','Toss leaves with coconut, onion, and chili.',2,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-dinner-veg-2-gotu-kola-mallung',4,'Season','Add lime juice and salt to taste.',0,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-dinner-veg-2-gotu-kola-mallung',5,'Serve','Serve immediately as a fresh side.',0,false,NULL);
INSERT INTO dishes VALUES ('sri_lankan-dinner-non-veg-1-lamprais','sri_lankan','Lamprais','Banana-leaf rice parcel with meat, sambol, and frikkadel.','Dinner','Non-Veg','https://images.unsplash.com/photo-1589302168068-964664a07101?w=800&q=80',40,90,'["rice","meat curry","frikkadel","sambol","banana leaf"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-dinner-non-veg-1-lamprais',1,'Cook components','Prepare rice, curry, and frikkadel separately.',0,true,60);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-dinner-non-veg-1-lamprais',2,'Layer','Layer rice and curries on banana leaf.',15,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-dinner-non-veg-1-lamprais',3,'Wrap','Fold leaf parcel securely.',5,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-dinner-non-veg-1-lamprais',4,'Bake','Bake parcels until aromas meld.',0,true,35);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-dinner-non-veg-1-lamprais',5,'Serve','Open at the table and serve hot.',0,false,NULL);
INSERT INTO dishes VALUES ('sri_lankan-dinner-non-veg-2-devilled-prawns','sri_lankan','Devilled Prawns','Prawns tossed in sweet-spicy tomato chili glaze.','Dinner','Non-Veg','https://images.unsplash.com/photo-1565680018434-b703d6b0d332?w=800&q=80',15,15,'["prawns","tomato","chili","ketchup","spring onion"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-dinner-non-veg-2-devilled-prawns',1,'Prep prawns','Clean and pat prawns dry.',5,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-dinner-non-veg-2-devilled-prawns',2,'Make sauce','Cook tomato, chili, and ketchup until thick.',0,true,6);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-dinner-non-veg-2-devilled-prawns',3,'Sear prawns','Quick sear prawns until pink.',0,true,4);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-dinner-non-veg-2-devilled-prawns',4,'Toss','Coat prawns in devilled sauce.',0,true,2);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('sri_lankan-dinner-non-veg-2-devilled-prawns',5,'Serve','Garnish with spring onion and serve.',0,false,NULL);
INSERT INTO dishes VALUES ('indian-breakfast-veg-1-masala-dosa','indian','Masala Dosa','Crispy fermented crepe filled with spiced potato.','Breakfast','Veg','https://images.unsplash.com/photo-1630384060420-c9d46e2e8c2e?w=800&q=80',20,25,'["dosa batter","potatoes","mustard seeds","curry leaves","turmeric","coconut chutney"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-breakfast-veg-1-masala-dosa',1,'Prep batter','Stir fermented dosa batter gently.',5,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-breakfast-veg-1-masala-dosa',2,'Make filling','Sauté mustard, curry leaves, and potato masala.',0,true,12);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-breakfast-veg-1-masala-dosa',3,'Cook dosa','Spread batter thin and drizzle oil until crisp.',0,true,4);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-breakfast-veg-1-masala-dosa',4,'Fill','Place masala in center and fold dosa.',1,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-breakfast-veg-1-masala-dosa',5,'Serve','Serve with coconut chutney and sambar.',0,false,NULL);
INSERT INTO dishes VALUES ('indian-breakfast-veg-2-poha','indian','Poha','Flattened rice with peanuts, turmeric, and fresh coriander.','Breakfast','Veg','https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',10,15,'["thick poha","peanuts","mustard seeds","turmeric","coriander","lemon"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-breakfast-veg-2-poha',1,'Rinse poha','Rinse thick poha and drain well.',3,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-breakfast-veg-2-poha',2,'Temper','Fry mustard, peanuts, and curry leaves.',0,true,4);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-breakfast-veg-2-poha',3,'Cook','Add poha, turmeric, and steam briefly.',0,true,5);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-breakfast-veg-2-poha',4,'Finish','Squeeze lemon and add coriander.',1,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-breakfast-veg-2-poha',5,'Serve','Serve warm with sev on top.',0,false,NULL);
INSERT INTO dishes VALUES ('indian-breakfast-non-veg-1-egg-bhurji','indian','Egg Bhurji','Soft scrambled eggs with onion, tomato, and masala.','Breakfast','Non-Veg','https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80',10,12,'["eggs","onion","tomato","green chili","garam masala"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-breakfast-non-veg-1-egg-bhurji',1,'Sauté base','Cook onion, tomato, and green chili.',0,true,6);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-breakfast-non-veg-1-egg-bhurji',2,'Add spices','Stir in turmeric, chili, and garam masala.',1,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-breakfast-non-veg-1-egg-bhurji',3,'Scramble','Add beaten eggs and scramble gently.',0,true,4);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-breakfast-non-veg-1-egg-bhurji',4,'Finish','Cook until just set and moist.',1,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-breakfast-non-veg-1-egg-bhurji',5,'Serve','Serve with buttered pav or paratha.',0,false,NULL);
INSERT INTO dishes VALUES ('indian-breakfast-non-veg-2-chicken-keema-pav','indian','Chicken Keema Pav','Spiced minced chicken served with buttered pav rolls.','Breakfast','Non-Veg','https://images.unsplash.com/photo-1603894584371-6a46dc30ff6b?w=800&q=80',15,25,'["minced chicken","ginger-garlic","tomato","pav rolls","butter"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-breakfast-non-veg-2-chicken-keema-pav',1,'Brown keema','Cook minced chicken with ginger-garlic.',0,true,8);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-breakfast-non-veg-2-chicken-keema-pav',2,'Simmer','Add tomato and spices; simmer until thick.',0,true,12);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-breakfast-non-veg-2-chicken-keema-pav',3,'Toast pav','Butter and toast pav on griddle.',0,true,3);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-breakfast-non-veg-2-chicken-keema-pav',4,'Garnish','Top keema with coriander and lime.',1,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-breakfast-non-veg-2-chicken-keema-pav',5,'Serve','Serve keema with hot pav and onions.',0,false,NULL);
INSERT INTO dishes VALUES ('indian-lunch-veg-1-dal-tadka','indian','Dal Tadka','Yellow lentils finished with ghee, cumin, and garlic tempering.','Lunch','Veg','https://images.unsplash.com/photo-1585937421612-70a008592f82?w=800&q=80',10,35,'["toor dal","turmeric","ghee","cumin","garlic","dried chili"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-lunch-veg-1-dal-tadka',1,'Cook dal','Pressure cook toor dal with turmeric.',0,true,20);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-lunch-veg-1-dal-tadka',2,'Mash','Whisk dal smooth and adjust consistency.',2,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-lunch-veg-1-dal-tadka',3,'Temper','Fry cumin, garlic, and dried chili in ghee.',0,true,4);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-lunch-veg-1-dal-tadka',4,'Combine','Pour tadka over dal and simmer.',0,true,5);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-lunch-veg-1-dal-tadka',5,'Serve','Serve with jeera rice and pickle.',0,false,NULL);
INSERT INTO dishes VALUES ('indian-lunch-veg-2-paneer-butter-masala','indian','Paneer Butter Masala','Paneer in creamy tomato butter sauce.','Lunch','Veg','https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80',20,30,'["paneer","tomato","onion","cream","butter","garam masala"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-lunch-veg-2-paneer-butter-masala',1,'Sauté base','Cook onion-tomato puree with spices.',0,true,12);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-lunch-veg-2-paneer-butter-masala',2,'Blend','Blend sauce until silky smooth.',3,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-lunch-veg-2-paneer-butter-masala',3,'Simmer','Simmer with cream and butter.',0,true,10);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-lunch-veg-2-paneer-butter-masala',4,'Add paneer','Add paneer cubes and simmer gently.',0,true,5);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-lunch-veg-2-paneer-butter-masala',5,'Serve','Garnish with cream and fenugreek leaves.',0,false,NULL);
INSERT INTO dishes VALUES ('indian-lunch-non-veg-1-chicken-biryani','indian','Chicken Biryani','Fragrant layered rice with marinated chicken and saffron.','Lunch','Non-Veg','https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',40,60,'["basmati rice","chicken","yogurt","biryani masala","saffron","fried onions"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-lunch-non-veg-1-chicken-biryani',1,'Marinate','Marinate chicken with yogurt and biryani masala.',0,true,30);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-lunch-non-veg-1-chicken-biryani',2,'Parboil rice','Parboil basmati with whole spices.',0,true,10);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-lunch-non-veg-1-chicken-biryani',3,'Layer','Layer rice and chicken with herbs.',10,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-lunch-non-veg-1-chicken-biryani',4,'Dum cook','Seal pot and cook on low heat.',0,true,35);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-lunch-non-veg-1-chicken-biryani',5,'Serve','Rest 10 minutes, then fluff and serve.',0,true,10);
INSERT INTO dishes VALUES ('indian-lunch-non-veg-2-fish-curry-coastal','indian','Fish Curry (Coastal)','Tamarind coconut fish curry with curry leaves.','Lunch','Non-Veg','https://images.unsplash.com/photo-1519708227418-c8fd9a91b2c8?w=800&q=80',15,25,'["white fish","coconut","tamarind","curry leaves","chili"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-lunch-non-veg-2-fish-curry-coastal',1,'Make masala','Grind coconut, chili, and tamarind base.',5,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-lunch-non-veg-2-fish-curry-coastal',2,'Simmer sauce','Cook masala with water until fragrant.',0,true,10);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-lunch-non-veg-2-fish-curry-coastal',3,'Add fish','Slide fish pieces into curry gently.',0,true,8);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-lunch-non-veg-2-fish-curry-coastal',4,'Finish','Swirl coconut oil and curry leaves.',2,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-lunch-non-veg-2-fish-curry-coastal',5,'Serve','Serve with steamed rice.',0,false,NULL);
INSERT INTO dishes VALUES ('indian-dinner-veg-1-palak-paneer','indian','Palak Paneer','Cottage cheese in spiced spinach gravy.','Dinner','Veg','https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80',20,25,'["spinach","paneer","onion","tomato","cream","garam masala"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-dinner-veg-1-palak-paneer',1,'Blanch spinach','Blanch spinach and blend smooth.',0,true,5);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-dinner-veg-1-palak-paneer',2,'Make gravy','Cook onion-tomato masala base.',0,true,10);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-dinner-veg-1-palak-paneer',3,'Add spinach','Stir in spinach purée and simmer.',0,true,8);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-dinner-veg-1-palak-paneer',4,'Add paneer','Add paneer and cream; simmer gently.',0,true,5);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-dinner-veg-1-palak-paneer',5,'Serve','Serve hot with naan or roti.',0,false,NULL);
INSERT INTO dishes VALUES ('indian-dinner-veg-2-vegetable-biryani','indian','Vegetable Biryani','Layered vegetable biryani with fried onions and saffron.','Dinner','Veg','https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',35,50,'["basmati rice","mixed vegetables","biryani masala","fried onions","saffron"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-dinner-veg-2-vegetable-biryani',1,'Cook veg','Cook spiced vegetables until tender.',0,true,15);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-dinner-veg-2-vegetable-biryani',2,'Parboil rice','Parboil rice with whole spices.',0,true,10);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-dinner-veg-2-vegetable-biryani',3,'Layer','Layer rice, vegetables, and fried onions.',10,false,NULL);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-dinner-veg-2-vegetable-biryani',4,'Dum','Dum cook on low until aromatic.',0,true,30);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-dinner-veg-2-vegetable-biryani',5,'Serve','Serve with raita and salad.',0,false,NULL);
INSERT INTO dishes VALUES ('indian-dinner-non-veg-1-butter-chicken','indian','Butter Chicken','Tandoori-style chicken in creamy tomato makhani sauce.','Dinner','Non-Veg','https://images.unsplash.com/photo-1603894584371-6a46dc30ff6b?w=800&q=80',30,45,'["chicken","yogurt","tomato","butter","cream","kasuri methi"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-dinner-non-veg-1-butter-chicken',1,'Marinate','Marinate chicken in yogurt and spices.',0,true,30);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-dinner-non-veg-1-butter-chicken',2,'Grill','Char chicken in oven or pan.',0,true,12);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-dinner-non-veg-1-butter-chicken',3,'Make sauce','Simmer tomato, butter, and cream sauce.',0,true,15);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-dinner-non-veg-1-butter-chicken',4,'Combine','Add chicken and simmer together.',0,true,10);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-dinner-non-veg-1-butter-chicken',5,'Serve','Finish with butter and serve with naan.',0,false,NULL);
INSERT INTO dishes VALUES ('indian-dinner-non-veg-2-lamb-rogan-josh','indian','Lamb Rogan Josh','Kashmiri lamb curry with aromatic red gravy.','Dinner','Non-Veg','https://images.unsplash.com/photo-1603894584371-6a46dc30ff6b?w=800&q=80',25,90,'["lamb","Kashmiri chili","yogurt","fennel","ginger"]');
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-dinner-non-veg-2-lamb-rogan-josh',1,'Brown lamb','Brown lamb pieces in oil.',0,true,12);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-dinner-non-veg-2-lamb-rogan-josh',2,'Bloom spices','Add Kashmiri chili and yogurt slowly.',0,true,10);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-dinner-non-veg-2-lamb-rogan-josh',3,'Braise','Braise covered until lamb is tender.',0,true,60);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-dinner-non-veg-2-lamb-rogan-josh',4,'Reduce','Uncover and reduce gravy.',0,true,10);
INSERT INTO dish_steps (dish_id,step_number,title,instruction,break_time_minutes,timer_required,timer_minutes) VALUES ('indian-dinner-non-veg-2-lamb-rogan-josh',5,'Serve','Serve with steamed basmati rice.',0,false,NULL);

-- Verify (optional)
SELECT 'cuisines' AS table_name, COUNT(*)::int AS rows FROM cuisines
UNION ALL SELECT 'dishes', COUNT(*)::int FROM dishes
UNION ALL SELECT 'dish_steps', COUNT(*)::int FROM dish_steps;