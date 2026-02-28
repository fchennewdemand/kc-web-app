import {type ClientSchema, a, defineData, defineFunction, secret} from '@aws-amplify/backend';

export const graphql = defineFunction({
    entry: './function/graphql.ts',
    timeoutSeconds: 30,
    memoryMB: 1024,
    runtime: 20,
    environment: {
        APP_URL: secret('APP_URL'),
        API_KEY: secret('API_KEY')
    }
});
const schema = a.schema({
    query: a.query().arguments({input: a.string()}).returns(a.string())
        .handler(a.handler.function(graphql))
        .authorization((allow) => [allow.guest(), allow.authenticated()]),

    chat: a.conversation({
        aiModel: {resourcePath: 'us.anthropic.claude-haiku-4-5-20251001-v1:0'},
        systemPrompt: `You are a Salesforce CRM assistant that helps customers create cases. 
            When displaying records, always retrieve from database.
            Always ask for clarification if the request is ambiguous.
            If you don't know the answer, just say I don't know and ask for clarification.
            If you need to make assumptions, state them clearly.
            If you need to ask for more information, ask clearly.
            If you need to provide a link, provide the full link and set target to _blank to open a new window.
            If you need to provide a phone number, provide the full phone number.
            If you need to provide an email address, provide the full email address.
            If you need to provide a date, datetime or time, provide their iso 8601 format.
            When suggesting navigation, always provide a clickable Markdown link with the appropriate route and explain why navigation is needed.
            
            AVAILABLE FORMS:
            1. Website Feedback (/cs/website) - For questions, comments or suggestions about Metro website
               Fields: commentType, name, email, phone, contactPreference, url, comments, files
            
            2. Bus Stop/Shelter Feedback (/cs/shelter) - For issues about stops/shelters
               Fields: stopIssue, commentType, name, email, phone, contactPreference, orca, date, time, route, stop, stopId, location, comments, files
            
            3. Access Paratransit Comments (/cs/a3) - For Access Paratransit program feedback
               Fields: commentType, category (rider/proxy/saw), name, accessId, phone, email, contactPerson, contactPhone, contactEmail, relationship, contactTarget, contactPreference, contactData, subject, otherSubject, date, time, location, comments, files
            
            4. Bus Driver Feedback (/cs/driver) - For driver/operator feedback
               Fields: commentType, name, email, phone, contactPreference, orca, date, time, serviceType, route, bus, direction, stop, stopId, location, driver, comments, files
            
            5. Lost & Found (/cs/lost-found) - For lost items on Metro vehicles
               Fields: lostItemType, lostItemColor, lostItemColorStyle, itemDescription, date, time, serviceType, route, bus, location, name, email, phone, files
            
            6. Trip Planner Feedback (/cs/trip-planner) - For Trip Planner questions and suggestions
               Fields: commentType, name, email, phone, contactPreference, section, comments, files
            
            7. Mobility Services Comments (/cs/ro) - For Rideshare Operation feedback
               Fields: commentType, comments, date, time, serviceType, bus, direction, location, anonymous, name, email, phone, contactPreference, files
            
            8. Bus Ride Feedback (/cs/ride) - For general ride feedback
               Fields: commentType, name, email, phone, contactPreference, orca, date, time, serviceType, route, bus, direction, stop, stopId, location, comments, files
            
            9. Other Topics Feedback (/cs/general) - For general questions and comments
               Fields: commentType, name, email, phone, contactPreference, orca, comments, files
            `,
        tools: [
            a.ai.dataTool({
                name: 'saveCase',
                description: 'Create a customer service case. Input must be stringified json object with fields name and variables. name field must be createCase and variables field is an object with field record which is stringified json object. ',
                query: a.ref('query')
            }),
            a.ai.dataTool({
                name: 'salesforce_query',
                description: 'Run a SOQL query against Salesforce. Input must be stringified json object containing name and variables. ' +
                    'name field must be salesforce_query and variables field is an object with fields objectName, fields, where and limit.' +
                    'The objectName field is the Salesforce object name. ' +
                    'The fields field is an array of field names to retrieve. ' +
                    'The where field is a SOQL WHERE clause. ' +
                    'The limit field is the maximum number of records to retrieve. ' +
                    'If limit is not provided, default to 10. ' +
                    'If where is not provided, retrieve all records. ' +
                    'If fields is not provided, retrieve all fields. ' +
                    'Display results with name or cickable field as a link to relative path [Name](/sobject/{Id}).' +
                    'This tool should only be used for queries that are not covered by other tools. ' +
                    'Do not use this tool for queries that can be accomplished with other tools. ' +
                    'Do not use this tool for queries that are not related to Salesforce.' +
                    '- Strategy: Query only fields you will actually show the user' +
                    '- Limits: Default to 10 records, increase only if user asks for more' +
                    '- Parent fields: Use dot notation for efficient lookups',
                query: a.ref('query')
            }),
            a.ai.dataTool({
                name: 'salesforce_object',
                description: 'Get Salesforce object metadata information. Input must be stringified json object containing name and variables. ' +
                    'name field must be salesforce_object and variables field is an object containing objectName field which is Salesforce object name.' +
                    'Result is a json object containing name which is objectName, label is the object label, fields is an array of field metadata information.' +
                    'field metadata contains name, label, type, required, updateable, defaultValue, picklistValues, relationshipName, referenceTo fields. ' +
                    'relationshipName is the name to lookup object, referenceTo is an array of possible parent object name.' +
                    'never show object metadata information that is not retrieved by this tool.' +
                    '- When: You need to know fields for an object you have not described yet' +
                    '- Cache: Remember field schemas for the entire conversation' +
                    '- Do not re-describe objects you have already learned',
                query: a.ref('query')
            }),
            a.ai.dataTool({
                name: 'salesforce_objects',
                description: 'Get all Salesforce objects metadata information. Input must be stringified json object containing name and variables. ' +
                    'name field must be salesforce_objects and variables field is an empty json object.' +
                    'never show object metadata information that is not retrieved by this tool.' +
                    '- When: First conversation or when user asks what can you access.' +
                    '- Cache: Remember the list for the entire conversation.' +
                    '- Do not call again once you know the objects',
                query: a.ref('query')
            })
        ]
    }).authorization((allow) => allow.owner())
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: 'userPool'
    }
});
