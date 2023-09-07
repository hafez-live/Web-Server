import GraphQLJSON from 'graphql-type-json';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType('Poem')
export class WebType
{
    @Field()
    statusCode: number;

    @Field(() => GraphQLJSON)
    data: JSON;

    @Field()
    message: string;
}
