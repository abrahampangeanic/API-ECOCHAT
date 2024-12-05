

class QuestionService {

  getLanguageMap() {
    const languageMap = {
      EN: 'English',
      ES: 'Spanish',
      PT: 'Portuguese',
      FR: 'French',
      DE: 'German',
    }
    return languageMap;
  }

  getPipelineMap() {
    const pipelineMap = {
      QA: 'qa',
      SEARCH: 'search',
      SUMMARIZATION: 'summarize',
      GENERATE: 'generate',
      SOCIAL_INTERACTION: 'social',
    };
    return pipelineMap;
  }

  isAssistantAccessDenied(Data, assistantId) {
    for (const group of Data) {
      for (const permission of group.permissions) {
        if (permission.assistantId === assistantId && permission.accessMode === "DENIED") {
          return true;
        }
      }
    }
    return false;
  }

  isAssistantAccessRESTRICTED(Data, assistantId) {
    for (const group of Data) {
      for (const permission of group.permissions) {
        if (permission.assistantId === assistantId && permission.accessMode === "RESTRICTED") {
          return true;
        }
      }
    }
    return false;
  }

  isCollectionAccessDenied(Data, collections) {
    for (const group of Data) {
      for (const permission of group.permissions) {
        if (collections.includes(permission.collectionId) && permission.accessMode === "DENIED") {
          return true;
        }
      }
    }
    return false;
  }

  isCollectionAccessRESTRICTED(Data, collectionId) {
    for (const group of Data) {
      for (const permission of group.permissions) {
        if (permission.collectionId === collectionId && permission.accessMode === "RESTRICTED") {
          return true;
        }
      }
    }
    return false;
  }

  isSkillAccess(skills, pipeline) {
    return skills.some(objeto => objeto.name === pipeline)
  }

  getCollectionsAllowed(groups, collections) {
    const collectionsDenied = groups.flatMap(group =>
      group.permissions
        .filter(permission => 
          permission.resource === "COLLECTION" &&
          permission.accessMode === "DENIED" &&
          permission.collectionId
        )
        .map(permission => permission.collectionId)
    );
    
    const collectionsAllow = collections.filter(collection => !collectionsDenied.includes(collection));
    
    // return collections;
    return collectionsAllow.length > 0 ? collectionsAllow : false;
  }

  getReferenceAllowed(groups, references) {
    const collectionsDenied = groups.flatMap(group =>
      group.permissions
        .filter(permission => 
          permission.resource === "COLLECTION" &&
          permission.accessMode === "RESTRICTED" &&
          permission.collectionId
        )
        .map(permission => permission.collectionId)
    );
    
    // Filtrar las referencias cuyo array de collections no incluye colecciones denegadas
    const filteredRefs = references.filter(ref =>
      !ref.source_metadata.collections.some((collection) =>
        collectionsDenied.includes(collection)
      )
    );

    return filteredRefs;
  }

}

module.exports = QuestionService;