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
	// console.log('JV | CreateGearCompendium | game: ', game);
	// console.log('JV | CreateGearCompendium | CONFIG: ', CONFIG);

	const gear = getData();
	console.log('JV | gear: ', gear);

	const pack = await createCompendium(compendiumName);
	console.log('JV | ImportGearCompendium | pack: ', pack);

	const foundryGearList = parseGear(gear);
	console.log('JV | ImportGearCompendium | foundryGearList: ', foundryGearList);

	for (const gear of foundryGearList) {
		await pack.importDocument(gear);
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
			"_id": null, // leave null
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
			// sort: 0,
			// ownership: {
			// 	default: 0,
			// },
			// flags: {},
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

async function createCompendium(compendiumName: string): Promise<CompendiumCollection> {
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
}
