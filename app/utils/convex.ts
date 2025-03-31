interface ConvexProjectInfo {
  projectId: string;
  teamId: string;
  projectName: string;
}

export function parseConvexToken(token: string): ConvexProjectInfo | null {
  try {
    // The token format is "project:teamId:projectName|..."
    const [projectPart] = token.split('|');
    const [, teamId, projectName] = projectPart.split(':');

    if (!teamId || !projectName) {
      return null;
    }

    return {
      projectId: projectPart,
      teamId,
      projectName,
    };
  } catch (error) {
    console.error('Error parsing Convex token:', error);
    return null;
  }
}
