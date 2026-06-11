import Image from "next/image";
import Link from "next/link";
import {
  IconBook2,
  IconCalendar,
  IconChefHat,
  IconList,
  IconMicrophone,
  IconSearch,
} from "@tabler/icons-react";
import { GenerateIcon } from "@/components/icons/GenerateIcon";
import { Logo } from "@/components/brand/Logo";
import { GenerateRecipePopup } from "@/components/home/GenerateRecipePopup";

const FEATURES = [
  {
    icon: IconSearch,
    title: "Explore cuisines",
    description:
      "Browse Chinese, Indian, and Sri Lankan dishes by meal and diet — veg or non-veg — with photos, prep times, and full recipes.",
    href: "/cuisines",
    cta: "View cuisines",
  },
  {
    icon: IconList,
    title: "Step-by-step cooking",
    description:
      "Follow guided steps with built-in timers and break reminders so you never lose track while cooking.",
    href: "/cuisines",
    cta: "Pick a dish",
  },
  {
    icon: IconMicrophone,
    title: "Voice assistant",
    description:
      "Ask hands-free about ingredients, substitutions, and techniques — dish-specific help when you open voice from a recipe.",
    href: "/voice",
    cta: "Try voice",
  },
  {
    icon: GenerateIcon,
    title: "AI recipe generator",
    description:
      "Enter what you have in your kitchen and get a custom recipe matched to your chosen cuisine.",
    href: "/generate",
    cta: "Generate recipe",
  },
  {
    icon: IconBook2,
    title: "Your library",
    description:
      "Save dishes you love and return to them anytime from one place.",
    href: "/library",
    cta: "Open library",
  },
  {
    icon: IconCalendar,
    title: "Meal planning",
    description:
      "Plan breakfast, lunch, and dinner using your saved and predefined recipes. Generate shopping lists from selected date ranges and track what you need to buy.",
    href: "/meal-planning",
    cta: "Plan meals",
  },
] as const;

const STEPS = [
  {
    step: "1",
    title: "Choose a cuisine",
    text: "Start with Chinese, Indian, or Sri Lankan — filter by breakfast, lunch, or dinner.",
  },
  {
    step: "2",
    title: "Cook with guidance",
    text: "Use the step guide, timers, or voice assistant while you prepare the dish.",
  },
  {
    step: "3",
    title: "Save & repeat",
    text: "Keep favorites in your library or generate new recipes from ingredients at home.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
        <div className="space-y-6 text-center md:text-left">
          {/* <div className="flex justify-center md:justify-start">
            <Logo size={88} />
          </div> */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Cook with confidence
            </h1>
            <p className="text-lg text-muted md:text-xl">
              Chefie is your cooking companion for Chinese, Indian, and Sri Lankan
              flavors — with voice guidance, step-by-step mode, and custom AI
              recipes.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Link href="/cuisines" className="btn-primary text-base">
              <IconChefHat size={20} />
              Start Cooking
            </Link>
            <Link href="/generate" className="btn-secondary text-base">
              <GenerateIcon size={20} stroke={1.75} />
              Generate a recipe
            </Link>
          </div>
        </div>

        <div className="card relative aspect-[4/3] overflow-hidden bg-warm-50">
          <Image
            src="/home_page.png"
            alt="Warm kitchens, real recipes — cooking with Chefie"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
      </section>

      {/* About */}
      <section className="space-y-6">
        <header className="max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground">What is Chefie?</h2>
          <p className="mt-3 text-muted leading-relaxed">
            Chefie helps you discover authentic dishes from three vibrant culinary
            traditions and actually cook them — not just read about them. Every
            recipe comes from our curated database with real ingredients, cooking
            steps, and timing so you know exactly what to do next.
          </p>
          <p className="mt-3 text-muted leading-relaxed">
            Whether you are learning a new cuisine or improvising with what is in
            your pantry, Chefie combines structured guides with AI-powered tools
            so you spend less time guessing and more time enjoying the meal.
          </p>
        </header>
      </section>

      {/* Features */}
      <section className="space-y-6">
        <header>
          <h2 className="text-2xl font-bold text-foreground">What you can do</h2>
          <p className="mt-1 text-muted">
            Everything you need to go from craving to plated dish.
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description, href }) => (
            <Link
              key={title}
              href={href}
              className="card-hover flex flex-col gap-3 p-5"
            >
              <span className="icon-badge">
                <Icon size={24} stroke={1.75} />
              </span>
              <h3 className="card-title">{title}</h3>
              <p className="card-description flex-1 text-sm">
                {description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="card-section-warm p-6 md:p-10">
        <h2 className="text-2xl font-bold text-foreground">How it works</h2>
        <p className="mt-1 text-muted">Three simple steps to your next meal.</p>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ step, title, text }) => (
            <li key={step} className="space-y-2">
              <span className="step-badge">{step}</span>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted">{text}</p>
            </li>
          ))}
        </ol>
        {/* <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/cuisines" className="btn-primary">
            <IconChefHat size={18} />
            Explore cuisines
          </Link>
          <Link href="/voice" className="btn-secondary">
            <IconMicrophone size={18} />
            Voice assistant
          </Link>
        </div> */}
      </section>

      <GenerateRecipePopup />
    </div>
  );
}
