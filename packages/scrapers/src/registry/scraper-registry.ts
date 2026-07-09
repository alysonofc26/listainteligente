import type { ScraperInterface } from "../interfaces/scraper.interface";
import { CarrefourScraper } from "../carrefour/scraper";
import { AssaiScraper } from "../assai/scraper";
import { AtacadaoScraper } from "../atacadao/scraper";
import { PaoDeAcucarScraper } from "../paodeacucar/scraper";

type ScraperConstructor = new () => ScraperInterface;

export class ScraperRegistry {
  private static scrapers = new Map<string, ScraperConstructor>([
    ["carrefour", CarrefourScraper as ScraperConstructor],
    ["assai", AssaiScraper as ScraperConstructor],
    ["atacadao", AtacadaoScraper as ScraperConstructor],
    ["paodeacucar", PaoDeAcucarScraper as ScraperConstructor],
  ]);

  static register(slug: string, scraper: ScraperConstructor): void {
    this.scrapers.set(slug, scraper);
  }

  static get(slug: string): ScraperInterface {
    const Constructor = this.scrapers.get(slug);
    if (!Constructor) {
      throw new Error(`No scraper registered for slug: ${slug}`);
    }
    return new Constructor();
  }

  static getAll(): ScraperInterface[] {
    return Array.from(this.scrapers.values()).map((Ctor) => new Ctor());
  }

  static getAvailableSlugs(): string[] {
    return Array.from(this.scrapers.keys());
  }
}
