export function sanitizeInput(input:string) {
  
    return input
        .replace(/\\/g, '\\\\')  // Escapes backslashes (\)
        .replace(/'/g, "\\'")     // Escapes single quotes (')
        .replace(/"/g, '\\"')     // Escapes double quotes (")
        .replace(/;/g, '\\;');    // Escapes semicolons (;)

}