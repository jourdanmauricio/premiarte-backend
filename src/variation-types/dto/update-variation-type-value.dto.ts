import { PartialType } from '@nestjs/swagger';
import { CreateVariationTypeValueDto } from './create-variation-type-value.dto';

export class UpdateVariationTypeValueDto extends PartialType(CreateVariationTypeValueDto) {}
