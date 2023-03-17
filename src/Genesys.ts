/**
 * FVTT-Genesys
 * Unofficial implementation of the Genesys RPG for Foundry
 *
 * @author Mezryss
 * @file System Entry Point
 */

import { register as registerConfig, ready as readyConfigs } from '@/config';
import { register as registerCombat } from '@/combat';
import { register as registerDice } from '@/dice';
import { register as registerEnrichers } from '@/enrichers';
import { register as registerFonts } from '@/fonts';
import { register as registerHandlebarsHelpers } from '@/handlebars';
import { NAMESPACE as SETTINGS_NAMESPACE, register as registerSettings } from '@/settings';
import { KEY_ALPHA_VERSION } from '@/settings/alpha';

import { register as registerStoryPointTracker } from '@/app/StoryPointTracker';
import { register as registerActors } from '@/actor';
import { register as registerEffects } from '@/effects';
import { register as registerItems } from '@/item';

// TODO Don't actually keep this here.
import { ImportGearCompendium } from '@/importers/GearImporter';

import './scss/index.scss';

async function doAlphaNotice() {
	if (!game.user.isGM) {
		return;
	}

	// Get the last-acknowledged Alpha version notice.
	const lastAlpha = game.settings.get(SETTINGS_NAMESPACE, KEY_ALPHA_VERSION) as string;

	const [lastMajor, lastMinor, lastRevision] = lastAlpha.split('.').map((v) => parseInt(v));
	const [currMajor, currMinor, currRevision] = game.system.version.split('.').map((v) => parseInt(v));

	if (lastMajor >= currMajor && lastMinor >= currMinor && lastRevision >= currRevision) {
		return;
	}

	const enrichedMessage = await TextEditor.enrichHTML(
		`
	<h3 style="font-family: 'Bebas Neue', sans-serif">Genesys Alpha ${game.system.version}</h3>
	<p>
		Hello! Thank you for giving the Genesys system a try! Please note that this system is currently in an alpha state; it is ready for some early playtesting and experimentation, but there are many features that are yet unimplemented and may be bugs!
	</p>
	<div style="text-align: center">@symbol[satfhd]</div>
	<h4 style="font-family: 'Bebas Neue', sans-serif">Bug Fixes & Updates</h4>
	<ul style="margin-top: 0">
		<li>Fixed <a href="https://github.com/Mezryss/FVTT-Genesys/issues/35">#35</a>: Active talents with no active category were listed twice.</li>
		<li>Fixed <a href="https://github.com/Mezryss/FVTT-Genesys/issues/36">#36</a>: Career item sheet was not showing editor view.</li>
	</ul>
	<h4 style="font-family: 'Bebas Neue', sans-serif">Roadmap</h4>
	<ul style="margin-top: 0">
		<li><strong>1.0:</strong> Core Rulebook Compatibility</li>
		<li><strong>1.1:</strong> Expanded Player's Guide Compatibility</li>
		<li><strong>1.2:</strong> First-Party Setting Books Compatibility</li>
		<li><strong>1.3:</strong> Community Feature Focus</li>
		<li><strong>1.4:</strong> Automation Focus</li>
	</ul>
	<div style="text-align: center">@dice[apbdcs]</div>
	<h4 style="font-family: 'Bebas Neue', sans-serif">Useful Links</h4>
	<ul style="margin-top: 0">
		<li><a href="https://github.com/Mezryss/FVTT-Genesys/wiki">Project Wiki</a></li>
		<li><a href="https://github.com/Mezryss/FVTT-Genesys">Project Source Code</a></li>
		<li><a href="https://github.com/Mezryss/FVTT-Genesys/discussions">Discuss The System</a></li>
		<li><a href="https://github.com/Mezryss/FVTT-Genesys/issues">Report Bugs &amp; Suggest Features</a></li>
		<li><a href="https://github.com/Mezryss/FVTT-Genesys/blob/main/LICENSE">Licensed under the MIT License</a></li>
	</ul>
	`,
		{ async: true },
	);

	await ChatMessage.create({
		user: game.user.id,
		content: enrichedMessage,
		type: CONST.CHAT_MESSAGE_TYPES.OTHER,
	});

	await game.settings.set(SETTINGS_NAMESPACE, KEY_ALPHA_VERSION, game.system.version);
}

Hooks.once('init', async () => {
	console.debug('Genesys | Initializing...');

	// System Documents
	registerActors();
	registerEffects();
	registerItems();

	// Misc. modules with one-time registrations
	registerCombat();
	registerEnrichers();
	registerFonts();
	registerDice();
	registerHandlebarsHelpers();
	registerSettings();
	registerConfig();

	console.debug('Genesys | Initialization Complete.');
});

Hooks.once('ready', async () => {
	registerStoryPointTracker();
	await doAlphaNotice();

	// TODO Testing the importer
	await ImportGearCompendium('Temp Gear', 'tempData/gear.json')

	readyConfigs();
});
