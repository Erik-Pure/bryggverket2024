import type {NumberRule} from 'sanity'

export default {
    name: 'beverage',
    type: 'document',
    title: 'Drycker',
    fields: [
        {
            name: 'title',
            type: 'string',
            title: 'Namn'
        },
        {
            name: 'slug',
            type: 'slug',
            title: 'Länk (tryck på Generate bara ->)',
            options: {
                source: 'title',
            }
        },
        {
            name: 'labelImage',
            type: 'image',
            title: 'Etikett',
        },
        {
            name: 'labelFront',
            type: 'number',
            title: 'Etikettens framsida, 0–100 (Valfritt)',
            description:
                'Var framsidans mitt ligger på etiketten, i procent från vänster kant. Styr vilken del av etiketten 3D-burken visar först. Lämna tomt för standardvärdet 60.',
            validation: (rule: NumberRule) => rule.min(0).max(100),
        },
        {
            name: 'can',
            type: 'string',
            title: 'Typ av burk',
            options: {
                list: [
                    {title: '33 Black can', value: 'black'},
                    {title: '33 White can', value: 'white'},
                    {title: '25 Sleek can', value: 'sleek'},
                    {title: '44 Big can', value: 'big'},
                ],
            }
        },
        {
            name: 'description',
            type: 'array',
            title: 'Beskrivning',
            of: [
                {
                    type: 'block',
                }
            ]
        },
        {
            name: 'percentage',
            type: 'number',
            title: 'Alkoholstyrka'
        },
        {
            name: 'style',
            type: 'string',
            title: 'Ölstil'
        },
        {
            name: 'category',
            type: 'string',
            title: 'Kategori',
            options: {
                list: [
                    {title: 'Starköl', value: 'strong'},
                    {title: 'Folköl', value: 'weak'},
                    {title: 'Läsk', value: 'soda'},
                    {title: 'Blanddryck', value: 'drink'},
                    {title: 'Alkoholfri öl', value: 'noalco'},
                ],
            }
        },
        {
            name: 'ingredients',
            type: 'array',
            title: 'Innehållsförteckning',
            of: [{
                type: 'block',
            }]
        },
        {
            name: 'link',
            type: 'string',
            title: 'Länk till systembolaget'
        },
        {
            name: 'bgColor',
            type: 'string',
            title: 'Bakgrundsfärg, hex: typ #b4d455 (Valfritt)'
        },
        {
            name: 'backgroundImage',
            type: 'image',
            title: 'Bakgrundsbild (Valfritt)',
        }
    ]
}