export const sanitizePrizeName = (name: string) => {
  return name.replace(/<\/?[^>]+(>|$)/g, " ​ ")
}