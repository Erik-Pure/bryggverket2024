export default {
    name: 'landing',
    type: 'document',
    title: '01 - Startsida',
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
            name: 'aboutTitle',
            type: 'string',
            title: 'Titel - Om oss',
        },
        {
            name: 'aboutIngress',
            type: 'string',
            title: 'Ingress - Om oss',
        },
        {
            name: 'aboutDesc',
            type: 'array',
            title: 'Text - Om oss',
            of: [
                {
                    type: 'block',
                }
            ]
        }, 
        {
            name: 'drinkTitle',
            type: 'string',
            title: 'Titel - Våra drycker',
        },
        {
            name: 'drinkIngress',
            type: 'string',
            title: 'Ingress - Våra drycker',
        },
        {
            name: 'drinkDesc',
            type: 'array',
            title: 'Text - Våra drycker',
            of: [
                {
                    type: 'block',
                }
            ]
        },
        {
            name: 'eventTitle',
            type: 'string',
            title: 'Titel - Event',
        },
        {
            name: 'eventIngress',
            type: 'string',
            title: 'Ingress - Event',
        },
        {
            name: 'eventDesc',
            type: 'array',
            title: 'Text - Event',
            of: [
                {
                    type: 'block',
                }
            ]
        },
        {
            name: 'merchTitle',
            type: 'string',
            title: 'Titel - Merch',
        },
        {
            name: 'merchIngress',
            type: 'string',
            title: 'Ingress - Merch',
        },
        {
            name: 'merchDesc',
            type: 'array',
            title: 'Text - Merch',
            of: [
                {
                    type: 'block',
                }
            ]
        },         
    ]
}