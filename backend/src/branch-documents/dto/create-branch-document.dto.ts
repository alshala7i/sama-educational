import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBranchDocumentDto {
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsIn(['LICENSE', 'CONTRACT'])
  type: string;

  // Received as string from multipart form-data, parsed in service
  @IsString()
  @IsNotEmpty()
  expiryDate: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
