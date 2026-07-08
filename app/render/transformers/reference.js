export const ReferenceTransformer = {
  async transform(ast, context = {}) {
    ast.references = ast.references || []
    ast.__referencesProcessed = true
    return ast
  }
}

export default ReferenceTransformer
