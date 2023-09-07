import { Resolver, Args, Query } from '@nestjs/graphql';

import { Locale } from '@/shared/enums';

import { WebType } from '@/poem/poem.type';
import { HttpStatus } from '@nestjs/common';

@Resolver(() => WebType)
export class WebResolver
{
    @Query(() => WebType)
    public async helloWorld(@Args('locale') locale: Locale)
    {
        return { statusCode: HttpStatus.OK, data: { locale }, message: 'Hello World!' };
    }
}
