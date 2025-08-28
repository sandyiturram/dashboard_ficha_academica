
export interface AcademicMember {
    id: string;
    name: string;
    sex: 'Femenino' | 'Masculino' | string;
    degree: string;
    institution: string;
    graduationYear: string;
    country: string;
    researchArea: string;
}

export interface SupervisedThesis {
    id: string;
    author: string;
    year: string;
    programType: 'Pregrado' | 'Postgrado' | string;
    programName: string;
    thesisTitle: string;
    institution: string;
    role: string;
    sameProgram: 'Sí' | 'No' | string;
    accessLink: string;
}

export interface Publication {
    id: string;
    type: string;
    authors: string;
    roleInPublication: string;
    year: string;
    articleTitle: string;
    journalName: string;
    bookTitle: string;
    chapterTitle: string;
    place: string;
    editorial: string;
    status: string;
    issn: string;
    accessLink: string;
    indexation: 'WOS' | 'Scopus' | 'Otro' | string;
}

export interface ResearchProject {
    id: string;
    title: string;
    fundingSource: string;
    adjudicationYear: string;
    executionPeriod: string;
    role: string;
    scope: string;
    accessLink: string;
}

export interface Patent {
    id: string;
    inventors: string;
    patentName: string;
    requestDate: string;
    publicationDate: string;
    registryNumber: string;
    status: string;
    accessLink: string;
}

export interface EducationalMaterial {
    id:string;
    academicName: string;
    materialType: string;
    title: string;
    year: string;
    curricularActivity: string;
    availability: string;
}

export interface AcademicWork {
    id:string;
    academicName: string;
    workType: string;
    title: string;
    year: string;
    curricularActivity: string;
    availability: string;
}

export interface Consultancy {
    id:string;
    title: string;
    contractingInstitution: string;
    adjudicationYear: string;
    executionPeriod: string;
    objective: string;
}

export interface CenterGroupNetwork {
    id:string;
    academicName: string;
    description: string;
    type: string;
    name: string;
    startDate: string;
    currentSituation: string;
    curricularActivity: string;
}

export interface AcademicData {
    academicMembers: AcademicMember[];
    supervisedTheses: SupervisedThesis[];
    publications: Publication[];
    patents: Patent[];
    researchProjects: ResearchProject[];
    educationalMaterials: EducationalMaterial[];
    academicWorks: AcademicWork[];
    consultancies: Consultancy[];
    centersGroupsNetworks: CenterGroupNetwork[];
}
