import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Type } from "class-transformer";

export class SoundIdeaSchema {
    @Prop({ type: String, required: false })
    proprietaryNature: string;
  
    @Prop({ type: Number, required: false })
    proprietaryNatureDoa: number;
  
    @Prop({ type: String, required: false })
    futurePlan: string;
  
    @Prop({ type: Number, required: false })
    futurePlanDoa: number;
  
    @Prop({ type: String, required: false })
    scalability: string;
  
    @Prop({ type: Number, required: false })
    scalabilityDoa: number;
  
    @Prop({ type: String, required: false })
    socioPolticalRelevance: string;
  
    @Prop({ type: Number, required: false })
    socioPolticalRelevanceDoa: number;
  
    @Prop({ type: String, required: false })
    validationOfIdea: string;
  
    @Prop({ type: Number, required: false })
    validationOfIdeaDoa: number;
  }

  export class PrototypeSchema {
    @Prop({ type: String, required: false })
    functionality: string;
  
    @Prop({ type: Number, required: false })
    functionalityDoa: number;
  
    @Prop({ type: String, required: false })
    viability: string;
  
    @Prop({ type: Number, required: false })
    viabilityDoa: number;
  
    @Prop({ type: String, required: false })
    userExprnce: string;
  
    @Prop({ type: Number, required: false })
    userExprnceDoa: number;
  
    @Prop({ type: String, required: false })
    innovation: string;
  
    @Prop({ type: Number, required: false })
    innovationDoa: number;
  
    @Prop({ type: String, required: false })
    costEffeciency: string;
  
    @Prop({ type: Number, required: false })
    costEffeciencyDoa: number;
  
    @Prop({ type: String, required: false })
    timeEffeciency: string;
  
    @Prop({ type: Number, required: false })
    timeEffeciencyDoa: number;
  }

  export class ManagementSchema {
    @Prop({ type: String, required: false })
    experienceAndExpertise: string;
  
    @Prop({ type: Number, required: false })
    experienceAndExpertiseDoa: number;
  
    @Prop({ type: String, required: false })
    visionAndStrategy: string;
  
    @Prop({ type: Number, required: false })
    visionAndStrategyDoa: number;
  
    @Prop({ type: String, required: false })
    executionSkills: string;
  
    @Prop({ type: Number, required: false })
    executionSkillsDoa: number;
  
    @Prop({ type: String, required: false })
    networkAndRelationships: string;
  
    @Prop({ type: Number, required: false })
    networkAndRelationshipsDoa: number;
  
    @Prop({ type: String, required: false })
    leadershipAndTeamDynamic: string;
  
    @Prop({ type: Number, required: false })
    leadershipAndTeamDynamicDoa: number;
  
    @Prop({ type: String, required: false })
    industryKnowledgeAndInsights: string;
  
    @Prop({ type: Number, required: false })
    industryKnowledgeAndInsightsDoa: number;
  }

  export class StrategicRelationshipSchema {
    @Prop({ type: String, required: false })
    partnership: string;
  
    @Prop({ type: Number, required: false })
    partnershipDoa: number;
  
    @Prop({ type: String, required: false })
    customerRelationship: string;
  
    @Prop({ type: Number, required: false })
    customerRelationshipDoa: number;
  
    @Prop({ type: String, required: false })
    supplierRelationship: string;
  
    @Prop({ type: Number, required: false })
    supplierRelationshipDoa: number;
  
    @Prop({ type: String, required: false })
    distributionChannel: string;
  
    @Prop({ type: Number, required: false })
    distributionChannelDoa: number;
  
    @Prop({ type: String, required: false })
    intellectualPropertyRelationship: string;
  
    @Prop({ type: Number, required: false })
    intellectualPropertyRelationshipDoa: number;
  }

  export class ProductRollOutSchema {
    @Prop({ type: String, required: false })
    marketPotential: string;
  
    @Prop({ type: Number, required: false })
    marketPotentialDoa: number;
  
    @Prop({ type: String, required: false })
    customerAcquisitionPlan: string;
  
    @Prop({ type: Number, required: false })
    customerAcquisitionPlanDoa: number;
  
    @Prop({ type: String, required: false })
    productDifferentiation: string;
  
    @Prop({ type: Number, required: false })
    productDifferentiationDoa: number;
  
    @Prop({ type: String, required: false })
    executionRisk: string;
  
    @Prop({ type: Number, required: false })
    executionRiskDoa: number;
  
    @Prop({ type: String, required: false })
    feedbackAndIterationProcess: string;
  
    @Prop({ type: Number, required: false })
    feedbackAndIterationProcessDoa: number;
  }

  export class berkusSchema {
    @Prop({ type: Object, required: false, default: {} })
    @Type(() => SoundIdeaSchema)
    soundIdea: SoundIdeaSchema;

    @Prop({ type: Object, required: false, default: {} })
    @Type(() => PrototypeSchema)
    prototype: PrototypeSchema;

    @Prop({ type: Object, required: false, default: {} })
    @Type(() => ManagementSchema)
    management: ManagementSchema;

    @Prop({ type: Object, required: false, default: {} })
    @Type(() => StrategicRelationshipSchema)
    strategicRelationship: StrategicRelationshipSchema;

    @Prop({ type: Object, required: false, default: {} })
    @Type(() => ProductRollOutSchema)
    productRollOut: ProductRollOutSchema;
}

  export class riskFactorSchema {
    @Prop({ type: String, required: false })
    managementRisk: string;

    @Prop({ type: Number, required: false })
    managementRiskRFCoeff: number;

    @Prop({ type: String, required: false })
    stateOfBusiness: string;

    @Prop({ type: Number, required: false })
    stateOfBusinessRFCoeff: number;

    @Prop({ type: String, required: false })
    politicalRisk: string;

    @Prop({ type: Number, required: false })
    politicalRiskRFCoeff: number;

    @Prop({ type: String, required: false })
    supplyChainOrManufacturingRisk: string;

    @Prop({ type: Number, required: false })
    supplyChainOrManufacturingRiskRFCoeff: number;

    @Prop({ type: String, required: false })
    salesAndMarketingRisk: string;

    @Prop({ type: Number, required: false })
    salesAndMarketingRiskRFCoeff: number;

    @Prop({ type: String, required: false })
    capitalRaisingRisk: string;

    @Prop({ type: Number, required: false })
    capitalRaisingRiskRFCoeff: number;

    @Prop({ type: String, required: false })
    competitionRisk: string;

    @Prop({ type: Number, required: false })
    competitionRiskRFCoeff: number;

    @Prop({ type: String, required: false })
    riskOfTechnology: string;

    @Prop({ type: Number, required: false })
    riskOfTechnologyRFCoeff: number;

    @Prop({ type: String, required: false })
    riskOfLitigation: string;

    @Prop({ type: Number, required: false })
    riskOfLitigationRFCoeff: number;

    @Prop({ type: String, required: false })
    internationalRisk: string;

    @Prop({ type: Number, required: false })
    internationalRiskRFCoeff: number;

    @Prop({ type: String, required: false })
    riskOfReputation: string;

    @Prop({ type: Number, required: false })
    riskOfReputationRFCoeff: number;

    @Prop({ type: String, required: false })
    exitValueRisk: string;

    @Prop({ type: Number, required: false })
    exitValueRiskRFCoeff: number;
}

export class BerkusValuationSchema {
    @Prop({ type: [{ type: Object }], required: false })
    soundIdeaValuation: object[];

    @Prop({ type: [{ type: Object }], required: false })
    prototypeValuation: object[];

    @Prop({ type: [{ type: Object }], required: false })
    managementValuation: object[];

    @Prop({ type: [{ type: Object }], required: false })
    strategicRelationshipValuation: object[];

    @Prop({ type: [{ type: Object }], required: false })
    productRollOutValuation: object[];
}

@Schema({ versionKey: false })
export class StartupValuation {
    @Prop({ type: String, required: false })
    processStateId: string;
    
    @Prop({ type: Object, required: false })
    @Type(() => berkusSchema)
    berkus: berkusSchema;

    @Prop({ type: Object, required: false })
    @Type(() => riskFactorSchema)
    riskFactor: riskFactorSchema;

    @Prop({ type: Object, required: false })
    @Type(() => BerkusValuationSchema)
    berkusValuation: BerkusValuationSchema;

    @Prop({ type: [{ type: Object }], required: false })
    riskFactorValuation: object[];
    
    @Prop({ default: () => new Date(), required: false, })
    modifiedOn: Date;

    @Prop({ default: () => new Date(), required: false })
    createdOn: Date;

    @Prop({ type:Boolean, default: false, required: false })
    isDeleted: boolean;
}

export type StartupValuationDocument = StartupValuation & Document;
export const StartupValuationSchema = SchemaFactory.createForClass(StartupValuation);