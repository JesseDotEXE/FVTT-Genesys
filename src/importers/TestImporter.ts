import GenesysItem from "@/item/GenesysItem";
import TalentDataModel from "@/item/data/TalentDataModel";

export async function TestCreateCompendiumAndImport() {
	console.log('JV | TestCreateCompendiumAndImport | game: ', game);
	// Throw away testing.
	const pack = await CompendiumCollection.createCompendium({
		id: "test-items", // Unique id
		label: "Test Items", // Foundry in app label
		name: "jesse-test-items", // The physical file name, must be unique
		packageName: "genemon", // ???
		packageType: "system", // ???
		path: "", // ??? I think we don't need this.
		system: "genesys", // I'd keep this as genesys or genemon
		type: "Item" // Enum of types allowed from Foundry
	});
	console.log('JV | TestCreateCompendiumAndImport | pack: ', pack);

	console.log('JV | TestCreateCompendiumAndImport | CONFIG: ', CONFIG);

	const talentData = {
		name: 'Test Talent - Imported',
		type: 'talent',
		"_id": null,
		img: "icons/svg/item-bag.svg",
		system: {
			description: "This is a talent from importer.",
			source: "Outside the world.",
			tier: 1,
			activation: {
				type: 'passive',
				detail: 'Hi there details.',
			},
			ranked: 'no',
			rank: 1,
		},
		effects: [],
		folder: null,
		sort: 0,
		ownership: {
			default: 0,
		},
		flags: {},
		"_stats": {
			"systemId": null,
			"systemVersion": null,
			"coreVersion": null,
			"createdTime": null,
			"modifiedTime": null,
			"lastModifiedBy": null
		}
	};
	const testTalent = new GenesysItem<TalentDataModel>(talentData);

	// const compendiumDocument = CONFIG.Item.documentClass;

	await pack.importDocument(testTalent);
}
