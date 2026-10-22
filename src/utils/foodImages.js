
const foodImages = {
  "Cooked Meals":
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85",

  Bakery:
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85",

  Fruits:
    "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=900&q=85",

  Vegetables:
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85",

  Packaged:
    "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=900&q=85",
};

const foodNameImages = {
  wraps:
    "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=85",

  "fruit cups":
    "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=85",

    "dal & rice meals":
  "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=85",

  "vegetable biryani":
  "https://images.unsplash.com/photo-1589302168068-964664d93dc0",

"Chole Bhature":
  "https://commons.wikimedia.org/wiki/Special:FilePath/A%20Plate%20of%20Chole%20Bhature.JPG?width=900",

"Mixed Celebration Platter":
  "https://images.unsplash.com/photo-1671510206533-6a8d5f8e0a3c?auto=format&fit=crop&w=900&q=85",
  
  "egg curry":
    "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=85",

  "egg roll":
    "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=85",

  // "chole bhature":
  //   "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=900&q=85",

  "paneer wraps":
    "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=85",

  "dal makhni":
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=85",

};

export function getFoodImage(donation) {
  // Always use the actual image uploaded by the provider.
  console.log("Food name:", donation?.foodName);
console.log("Selected image:", foodNameImages[donation?.foodName?.trim().toLowerCase()]);
  if (donation?.imageUrl) {
    return donation.imageUrl;
  }

  // Use a specific image when the food name matches.
  const foodName = donation?.foodName?.trim().toLowerCase();

  if (foodName && foodNameImages[foodName]) {
    return foodNameImages[foodName];
  }

  // Otherwise, use the category image.
  return foodImages[donation?.category] || foodImages["Cooked Meals"];
}
