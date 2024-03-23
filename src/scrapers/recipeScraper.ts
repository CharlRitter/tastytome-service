import { spawn } from 'child_process';

import { Request, Response } from 'express';

import { Recipe, ScrapedRecipe } from '@/types/common';
import { logger } from '@/utils/logger';

export async function scrapeRecipe(request: Request, response: Response): Promise<Response<Recipe | Error>> {
  try {
    const { recipeUrl } = request.body;
    const pythonProcess = spawn('python3', ['src/scrapers/recipe_scraper.py', recipeUrl]);
    let data = '';

    pythonProcess.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });

    return await new Promise((resolve) => {
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const scrapedRecipe: ScrapedRecipe = JSON.parse(data);

            let description = `Recipe retrieved from ${scrapedRecipe.host}.`;

            if (scrapedRecipe.yields) {
              description += `\nYields ${scrapedRecipe.yields}.`;
            }
            if (scrapedRecipe.total_time) {
              description += `\nTotal time ${scrapedRecipe.total_time} minutes.`;
            }
            if (scrapedRecipe.nutrients && Object.keys(scrapedRecipe.nutrients).length !== 0) {
              description += `\nNutrients:${Object.entries(scrapedRecipe.nutrients).map(
                ([key, value]) => `\n\t${key.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()}: ${value}`
              )}`;
            }

            const recipe = {
              title: scrapedRecipe.title,
              description,
              image: scrapedRecipe.image ?? null,
              recipeingredients: scrapedRecipe.ingredients,
              recipeinstructions: scrapedRecipe.instructions_list
            };
            resolve(response.status(200).json({ data: recipe }));
          } catch (error) {
            logger.error('Error parsing JSON data:', error);
            resolve(response.status(500).json({ message: 'Error parsing JSON data' }));
          }
        } else {
          logger.error(`Python script exited with code ${code}`);
          resolve(response.status(500).json({ message: 'Error executing Python script' }));
        }
      });

      pythonProcess.on('error', (error) => {
        logger.error('Error spawning Python process:', error);
        resolve(response.status(500).json({ message: 'Error spawning Python process' }));
      });
    });
  } catch (error: any) {
    logger.error('Error in scrapeRecipe:', error);
    return response.status(500).json({ message: 'Error scraping recipe' });
  }
}
