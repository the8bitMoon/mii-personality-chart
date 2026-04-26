// src/scripts/app.js

import van from 'vanjs-core';

const personalityClasses = [
	['observer', 'strategist', 'buddy', 'sweetie'], // Col 1
	['thinker', 'perfectionist', 'daydreamer', 'cheerleader'], // Col 2
	['rogue', 'achiever', 'merrymaker', 'charmer'], // Col 3
	['maverick', 'visionary', 'dynamo', 'gogetter'], // Col 4
];

const personalitiesUS = [
	['Observer', 'Strategist', 'Buddy', 'Sweetie'], // Col 1
	['Thinker', 'Perfectionist', 'Daydreamer', 'Cheerleader'], // Col 2
	['Rogue', 'Achiever', 'Merrymaker', 'Charmer'], // Col 3
	['Maverick', 'Visionary', 'Dynamo', 'Go-Getter'], // Col 4
];

const personalitiesUK = [
	['Introvert', 'Patient', 'Carer', 'Softie'], // Col 1
	['Thinker', 'Perfectionist', 'Dreamer', 'Optimist'], // Col 2
	['Individualist', 'Busy Bee', 'Bubbly', 'Charmer'], // Col 3
	['Headstrong', 'Leader', 'Hot-Blooded', 'Adventurer'], // Col 4
];

// Set up state for UI elements.
const movement = van.state(-1),
	speech = van.state(-1),
	energy = van.state(-1),
	thinking = van.state(-1),
	overall = van.state(-1),
	regionUS = van.state(true);

// Derived sums for actual personality score.
const ms = van.derive(() => movement.val + speech.val),
	et = van.derive(() => energy.val + thinking.val),
	msTier = van.derive(() => Math.floor(ms.val / 4)),
	etTier = van.derive(() => Math.floor(et.val / 4));

// Derive localized personality strings.
const personalities = van.derive(() =>
	regionUS.val ? personalitiesUS : personalitiesUK,
);

const {
	header,
	main,
	footer,
	section,
	div,
	span,
	input,
	button,
	label,
	aside,
	details,
	summary,
	h1,
	h2,
	h3,
	p,
	code,
	em,
	strong,
	small,
	a,
} = van.tags;

const RadioRow = (labelText, lowText, highText, state) => {
	let buttons = [];
	for (let i = 0; i < 8; i++) {
		buttons.push(
			input({
				name: labelText,
				type: 'radio',
				class: 'radio-check',
				value: i,
				style: `background-color: var(--color-${i})`,
				checked: () => state.val === i,
				onchange: () => (state.val = i),
			}),
		);
	}
	return div(
		{ class: 'radio-row' },
		h3(labelText),
		// p({ class: 'left-label' }, lowText),
		...buttons,
		// p({ class: 'right-label' }, highText),
	);
};

const PersonalityGrid = () => {
	return section(
		{ class: 'personality-grid' },
		personalityClasses
			.map((category, col) => {
				return category.map((personalityClass, row) => {
					return button(
						{
							onclick: (e) => {
								const lowerRowBound = row * 4,
									upperRowBound = Math.min(lowerRowBound + 3, 14),
									lowerColBound = col * 4,
									upperColBound = Math.min(lowerColBound + 3, 14);
								let sumMS, m, s;
								[movement.val, speech.val] = randomPair(
									lowerColBound,
									upperColBound,
								);
								[energy.val, thinking.val] = randomPair(
									lowerRowBound,
									upperRowBound,
								);
							},
							'data-selected-personality': () =>
								msTier.val === col && etTier.val === row,
							style: `grid-column: ${col + 1}; grid-row: ${4 - row}; background: var(--color-${personalityClass}`,
						},
						() => personalities.val[col][row],
					);
				});
			})
			.flat(2),
		div(
			{ class: 'region-select' },
			p('Region Select:'),
			span({ class: () => `indicator ${regionUS.val}` }, 'US'),
			input({
				type: 'checkbox',
				checked: () => regionUS.val,
				oninput: (e) => {
					regionUS.val = e.target.checked;
					console.debug(regionUS.val);
					console.debug(personalities.val);
				},
			}),
			span({ class: () => `indicator ${!regionUS.val}` }, 'UK'),
		),
	);
};

const App = () => {
	return [
		header(
			h1('Tomodachi Life: Living the Dream Personality Calculator'),
			details(
				summary('Explanation'),
				h2('How personalities are calculated:'),
				p(
					'The game adds the ',
					code('Movement'),
					' and ',
					code('Speech'),
					' stats to get the first value, corresponding to the ',
					strong('column'),
					' of the personality chart. Then, it adds the ',
					code('Energy'),
					' and ',
					code('Thinking'),
					' stats to get the second value, corresponding to the ',
					strong('row'),
					' of the personality chart. Because of this, there can be a wide variety of combinations that lead to the same personality type. The ',
					code('Overall'),
					' stat does ',
					em('not'),
					' affect the personality type. Instead, it affects the kinds of conversation the Mii will have. This tool works the same way as the game code.',
				),
				h2('How to use this tool:'),
				p(
					'You can set the stats in the top section, which will show you the personality type on the bottom section. Alternatively, you can choose a personality type on the bottom section, which will generate a ',
					em('random'),
					' valid set of stats on the top. You can re-roll the same personality type to get different stat spreads, and tweak the upper section to see how it changes the personality.',
				),
			),
		),
		main(
			section(
				{ class: 'radio-grid' },
				RadioRow('Movement', 'Slow', 'Quick', movement),
				RadioRow('Speech', 'Polite', 'Honest', speech),
				RadioRow('Energy', 'Flat', 'Varied', energy),
				RadioRow('Thinking', 'Serious', 'Chill', thinking),
			),
			aside(code('Overall'), " doesn't affect personality type."),
			PersonalityGrid(),
			aside('Select a personality type to view valid stats.'),
		),
		footer(
			small(
				'Site by ',
				a({ href: 'https://mothmello.duckdns.org' }, 'MothMello'),
				' based on ',
				a(
					{
						href: 'https://game8.co/games/Tomodachi-Life-Living-the-Dream/archives/591775',
					},
					'this guide',
				),
				' from game8.co.',
			),
		),
	];
};

van.add(document.body, App());

function randomPair(lower, upper) {
	let x, y, sum;
	do {
		x = Math.floor(Math.random() * 8);
		y = Math.floor(Math.random() * 8);
		sum = x + y;
	} while (sum < lower || sum > upper);
	return [x, y];
}
