// TODO 0. Check if Compendium Already Exists
// TODO 1. Load Data (CSV or JSON)
// TODO 2. IF CSV Convert to JSON
// TODO 3. Process JSON Data
// TODO 4. Create Items
// TODO 5. Create Compendium

/**
 * Gear Importer
 * Eventually, I'll make it reusable but I want to start with something simple.
 *
 * Data Format:
 * gameType - string | default to 'gear' for this file
 * name - string | name of item
 * type - string | consider this a subtype; will just prepend to description
 * price - number | value in whatever currency for the item
 * description - string | typical description of the item
 */
import { kebabCase } from "@/utils";
import GenesysItem from "@/item/GenesysItem";
import EquipmentDataModel from "@/item/data/EquipmentDataModel";

type GearImportObject = {
	name: string;
	description: string;
	source: string;
	rarity: number | null;
	encumbrance: number | null;
	price: number | null;
};

const testGearData = [
	{
		"name": "Jesse's Item",
		"description": "Human Human.",
		"source": "Outside the world.",
		"rarity": 5,
		"encumbrance": 1,
		"price": 1
	},
	{
		"name": "Cooper's Item",
		"description": "Bark Bark.",
		"source": "Outside the world.",
		"rarity": 10,
		"encumbrance": 1,
		"price": 1
	}
];

export async function ImportGearCompendium(compendiumName: string, fileName: string) {
	const gear = getData();
	const pack = await findOrCreateCompendium(compendiumName);
	const importedGearList = parseGear(gear);

	// @ts-ignore
	const existingGearList = await pack.getDocuments();

	for (const gear of importedGearList) {
		const currentImportId = gear?.flags?.importId;
		// @ts-ignore
		const existingCompendiumDocument = getExistingDocumentFromCompendium(existingGearList, currentImportId);

		if (!existingCompendiumDocument) {
			console.debug(`Creating new document with name [${gear.name}]`);

			await pack.importDocument(gear);
		} else {
			const idToDelete = existingCompendiumDocument.id;
			console.debug(`Replacing document with name [${gear.name}]`);

			pack.delete(idToDelete);
			await Item.deleteDocuments([idToDelete], { pack: pack.metadata.id }); // TODO Make this smarter.
			await pack.importDocument(gear);
		}
	}
}

/**
 * This function will eventually turn into something that allows a user to upload a file.
 */
function getData(): GearImportObject[]  {
	return testGearData;
}

function parseGear(importedGear: GearImportObject[]): GenesysItem<EquipmentDataModel>[] {
	const parsedGearList: GenesysItem<EquipmentDataModel>[] = [];

	for (const gear of importedGear) {
		const foundryGearData = {
			"_id": null, // leave null to populate
			name: gear.name,
			type: 'gear',
			img: "icons/svg/item-bag.svg", // default
			system: {
				description: gear.description,
				source: gear.source,
				rarity: gear.rarity,
				encumbrance: gear.encumbrance,
				price: gear.price,
				state: 'carried', // default
			},
			effects: [], // leave empty
			folder: null, // leave null
			flags: {
				importId: kebabCase(gear.name), // might need to convert this to a unique id from the imported data
			},
			// Leave the below commented out for reference.
			// sort: 0,
			// ownership: {
			// 	default: 0,
			// },
			// "_stats": {
			// 	"systemId": null,
			// 	"systemVersion": null,
			// 	"coreVersion": null,
			// 	"createdTime": null,
			// 	"modifiedTime": null,
			// 	"lastModifiedBy": null
			// }
		};
		const foundryGearObject = new GenesysItem<EquipmentDataModel>(foundryGearData);

		parsedGearList.push(foundryGearObject);
	}

	return parsedGearList;
}

function getExistingDocumentFromCompendium(compendiumDocuments: GenesysItem[], importId: Record<string, unknown> | undefined) {
	return compendiumDocuments.find(doc => doc?.flags?.importId === importId);
}

/**
 * This function doesn't work at the moment. Need to figure out a way to open .json files when built.
 * @param fileName
 */
async function fetchJSON(fileName: string): Promise<object> {
	const response = await fetch(fileName);
	let jsonResults = {};
	if (response) {
		jsonResults = response.json();
	}
	return jsonResults;
}

async function findOrCreateCompendium(compendiumName: string): Promise<CompendiumCollection> {
	const formattedLookupName = `world.${kebabCase(compendiumName)}`;
	let pack = game.packs.get(formattedLookupName);

	if (!pack) {
		console.log(`Creating compendium with name [${formattedLookupName}].`);
		return CompendiumCollection.createCompendium({
			id: kebabCase(compendiumName), // Unique id
			label: compendiumName, // Foundry in app label
			name: kebabCase(compendiumName), // The physical file name, must be unique
			packageName: "", // ??? Optional ???
			packageType: "system", // keep as system
			path: "", // ??? Optional ???
			system: "genesys", // keep as genesys
			type: "Item" // keep as Item
		});
	} else {
		console.log(`Found compendium with name [${formattedLookupName}].`);
	}

	return pack;
}
