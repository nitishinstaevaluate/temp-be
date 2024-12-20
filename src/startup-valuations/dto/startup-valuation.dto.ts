import { Type } from "class-transformer";
import { IsOptional, IsString, IsBoolean, ValidateNested, IsNumber, IsObject, IsArray } from "class-validator";

export class soundIdeaDto {
    @IsOptional()
    @IsString({ message: 'proprietaryNature is required' })
    proprietaryNature: string;

    @IsOptional()
    @IsNumber({}, { message: 'proprietaryNatureDoa is required' })
    proprietaryNatureDoa: number;
    
    @IsOptional()
    @IsString({ message: 'futurePlan is required' })
    futurePlan: string;
    
    @IsOptional()
    @IsNumber({}, { message: 'futurePlanDoa is required' })
    futurePlanDoa: number;
    
    @IsOptional()
    @IsString({ message: 'scalability is required' })
    scalability: string;
    
    @IsOptional()
    @IsNumber({}, { message: 'scalabilityDoa is required' })
    scalabilityDoa: number;
    
    @IsOptional()
    @IsString({ message: 'socioPolticalRelevance is required' })
    socioPolticalRelevance: string;
    
    @IsOptional()
    @IsNumber({}, { message: 'socioPolticalRelevanceDoa is required' })
    socioPolticalRelevanceDoa: number;
    
    @IsOptional()
    @IsString({ message: 'validationOfIdea is required' })
    validationOfIdea: string;

    @IsOptional()
    @IsNumber({}, { message: 'validationOfIdeaDoa is required' })
    validationOfIdeaDoa: number;
}

export class prototypeDto {
    @IsOptional()
    @IsString({ message: 'functionality is required' })
    functionality: string;

    @IsOptional()
    @IsNumber({}, { message: 'functionalityDoa is required' })
    functionalityDoa: number;
    
    @IsOptional()
    @IsString({ message: 'viability is required' })
    viability: string;
    
    @IsOptional()
    @IsNumber({}, { message: 'viabilityDoa is required' })
    viabilityDoa: number;
    
    @IsOptional()
    @IsString({ message: 'userExprnce is required' })
    userExprnce: string;
    
    @IsOptional()
    @IsNumber({}, { message: 'userExprnceDoa is required' })
    userExprnceDoa: number;
    
    @IsOptional()
    @IsString({ message: 'innovation is required' })
    innovation: string;
    
    @IsOptional()
    @IsNumber({}, { message: 'innovationDoa is required' })
    innovationDoa: number;
    
    @IsOptional()
    @IsString({ message: 'costEffeciency is required' })
    costEffeciency: string;

    @IsOptional()
    @IsNumber({}, { message: 'costEffeciencyDoa is required' })
    costEffeciencyDoa: number;

    @IsOptional()
    @IsString({ message: 'timeEffeciency is required' })
    timeEffeciency: string;

    @IsOptional()
    @IsNumber({}, { message: 'timeEffeciencyDoa is required' })
    timeEffeciencyDoa: number;
}

export class managementDto {
    @IsOptional()
    @IsString({ message: 'experienceAndExpertise is required' })
    experienceAndExpertise: string;

    @IsOptional()
    @IsNumber({}, { message: 'experienceAndExpertiseDoa is required' })
    experienceAndExpertiseDoa: number;
    
    @IsOptional()
    @IsString({ message: 'visionAndStrategy is required' })
    visionAndStrategy: string;
    
    @IsOptional()
    @IsNumber({}, { message: 'visionAndStrategyDoa is required' })
    visionAndStrategyDoa: number;
    
    @IsOptional()
    @IsString({ message: 'executionSkills is required' })
    executionSkills: string;
    
    @IsOptional()
    @IsNumber({}, { message: 'executionSkillsDoa is required' })
    executionSkillsDoa: number;
    
    @IsOptional()
    @IsString({ message: 'networkAndRelationships is required' })
    networkAndRelationships: string;
    
    @IsOptional()
    @IsNumber({}, { message: 'networkAndRelationshipsDoa is required' })
    networkAndRelationshipsDoa: number;
    
    @IsOptional()
    @IsString({ message: 'leadershipAndTeamDynamic is required' })
    leadershipAndTeamDynamic: string;

    @IsOptional()
    @IsNumber({}, { message: 'leadershipAndTeamDynamicDoa is required' })
    leadershipAndTeamDynamicDoa: number;

    @IsOptional()
    @IsString({ message: 'industryKnowledgeAndInsights is required' })
    industryKnowledgeAndInsights: string;

    @IsOptional()
    @IsNumber({}, { message: 'industryKnowledgeAndInsightsDoa is required' })
    industryKnowledgeAndInsightsDoa: number;
}

export class strategicRelationshipDto {
    @IsOptional()
    @IsString({ message: 'partnership is required' })
    partnership: string;

    @IsOptional()
    @IsNumber({}, { message: 'partnershipDoa is required' })
    partnershipDoa: number;
    
    @IsOptional()
    @IsString({ message: 'customerRelationship is required' })
    customerRelationship: string;
    
    @IsOptional()
    @IsNumber({}, { message: 'customerRelationshipDoa is required' })
    customerRelationshipDoa: number;
    
    @IsOptional()
    @IsString({ message: 'supplierRelationship is required' })
    supplierRelationship: string;
    
    @IsOptional()
    @IsNumber({}, { message: 'supplierRelationshipDoa is required' })
    supplierRelationshipDoa: number;
    
    @IsOptional()
    @IsString({ message: 'distributionChannel is required' })
    distributionChannel: string;
    
    @IsOptional()
    @IsNumber({}, { message: 'distributionChannelDoa is required' })
    distributionChannelDoa: number;
    
    @IsOptional()
    @IsString({ message: 'intellectualPropertyRelationship is required' })
    intellectualPropertyRelationship: string;

    @IsOptional()
    @IsNumber({}, { message: 'intellectualPropertyRelationshipDoa is required' })
    intellectualPropertyRelationshipDoa: number;
}

export class productRollOutDto {
    @IsOptional()
    @IsString({ message: 'marketPotential is required' })
    marketPotential: string;

    @IsOptional()
    @IsNumber({}, { message: 'marketPotentialDoa is required' })
    marketPotentialDoa: number;
    
    @IsOptional()
    @IsString({ message: 'customerAcquisitionPlan is required' })
    customerAcquisitionPlan: string;
    
    @IsOptional()
    @IsNumber({}, { message: 'customerAcquisitionPlanDoa is required' })
    customerAcquisitionPlanDoa: number;
    
    @IsOptional()
    @IsString({ message: 'productDifferentiation is required' })
    productDifferentiation: string;
    
    @IsOptional()
    @IsNumber({}, { message: 'productDifferentiationDoa is required' })
    productDifferentiationDoa: number;
    
    @IsOptional()
    @IsString({ message: 'executionRisk is required' })
    executionRisk: string;
    
    @IsOptional()
    @IsNumber({}, { message: 'executionRiskDoa is required' })
    executionRiskDoa: number;
    
    @IsOptional()
    @IsString({ message: 'feedbackAndIterationProcess is required' })
    feedbackAndIterationProcess: string;

    @IsOptional()
    @IsNumber({}, { message: 'feedbackAndIterationProcessDoa is required' })
    feedbackAndIterationProcessDoa: number;
}

export class berkusDto {
    @ValidateNested()
    @Type(() => soundIdeaDto)
    soundIdea: soundIdeaDto

    @ValidateNested()
    @Type(() => prototypeDto)
    prototype: prototypeDto

    @ValidateNested()
    @Type(() => managementDto)
    management: managementDto

    @ValidateNested()
    @Type(() => strategicRelationshipDto)
    strategicRelationship: strategicRelationshipDto

    @ValidateNested()
    @Type(() => productRollOutDto)
    productRollOut: productRollOutDto
}

export class berkusValuationDto {
    @IsArray()
    @IsObject({ each: true })
    soundIdeaValuation: object[]

    @IsArray()
    @IsObject({ each: true })
    prototypeValuation: object[]

    @IsArray()
    @IsObject({ each: true })
    managementValuation: object[]

    @IsArray()
    @IsObject({ each: true })
    strategicRelationshipValuation: object[]

    @IsArray()
    @IsObject({ each: true })    
    productRollOutValuation: object[]
}

export class StartupValuationDto {
    @IsOptional()
    @IsString({ message: 'processStateId is required' })
    processStateId: string;
    
    @IsOptional()
    @ValidateNested()
    @Type(() => berkusDto)
    berkus: berkusDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => berkusValuationDto)
    berkusValuation: berkusValuationDto;
}