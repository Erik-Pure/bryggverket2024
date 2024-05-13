export default {
    name: 'beverages',
    type: 'document',
    title: '02 - Våra drycker',
    fields: [
        {
            name: 'title',
            type: 'string',
            title: 'Titel'
        },       
        {
            name: 'ingress',
            type: 'string',
            title: 'Underrubrik'
        },
        {
            name: 'heroImage',
            type: 'image',
            title: 'Bakgrundsbild',
        },        
        {
            name: 'description',
            type: 'array',
            title: 'Samarbeten',
            of: [
                {
                    type: 'block',
                }
            ]
        },        
    ]
}