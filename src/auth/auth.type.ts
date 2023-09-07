import GraphQLJSON from 'graphql-type-json';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType('Auth')
export class AuthType
{
    @Field()
    statusCode: number;

    @Field(() => GraphQLJSON)
    data: JSON;

    @Field(() => GraphQLJSON)
    message: JSON;
}
