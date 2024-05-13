export default {
    name: 'book',
    type: 'document',
    title: '03 - Boka',
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
            title: 'Text',
            of: [
                {
                    type: 'block',
                }
            ]
        },        
    ]
}