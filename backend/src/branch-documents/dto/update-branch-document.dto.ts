import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateBranchDocumentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsIn(['LICENSE', 'CONTRACT'])
  type?: string;

  @IsOptional()
  @IsString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
