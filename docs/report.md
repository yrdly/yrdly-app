# 🧾 Neighbourhood App – Bug & Feedback Report (October 2025)

---

## 🏠 Homepage

### 1. Neighbours Cannot Like Posts
**Priority:** High  
**Issue:** Users cannot like posts directly from the homepage. The like button appears inactive.  
**Developer Notes:**  
- Verify API connection for the like endpoint.  
- Ensure event handlers are correctly bound to the post component.  
- Add optimistic UI update to reflect instant feedback on click.

---

### 2. Comment Counter Not Updating
**Priority:** Medium  
**Issue:** Comments are posted successfully, but the icon does not reflect the comment count (e.g. “1 comment”, “2 comments”).  
**Developer Notes:**  
- Update comment counter state after successful comment submission.  
- Sync with the backend comment count on page load and after each submission.

---

### 3. “What’s Happening in Your Neighbourhood” Text Misaligned
**Priority:** Low  
**Issue:** Placeholder text does not fit properly within its input box.  
**Developer Notes:**  
- Adjust font-size or padding within the text field container.  
- Verify responsive container dimensions.

---

### 4. Screen Responsiveness (Homepage)
**Priority:** High  
**Issue:** Content alignment issues across different screen sizes.  
**Developer Notes:**  
- Apply responsive CSS (Flexbox/Grid).  
- Use relative units (`vw`, `vh`, `%`, `rem`) instead of fixed `px`.  
- Test breakpoints: 480px, 768px, 1024px, 1440px.

---

## 🛒 Marketplace Page

### 5. Seller Posts Display Incorrect Buttons
**Priority:** High  
**Issue:** Sellers see “Buy Now” and “Chat” options on their own listings.  
**Expected:** Sellers should see *Edit* and *Delete* buttons.  
**Developer Notes:**  
- Add conditional rendering based on `currentUser.id === post.sellerId`.  
- Hide “Buy Now” and “Chat” when viewing own listings.

---

### 6. “Buy Now” Feature Not Implemented
**Priority:** High  
**Issue:** Button exists but has no functionality.  
**Developer Notes:**  
- Integrate payment flow (e.g. Paystack API).  
- Handle order creation, payment confirmation, and redirection.

---

### 7. Contact Seller Button Not Functional
**Priority:** Medium  
**Issue:** The “Contact Seller” button does not open a dedicated chat or profile view.  
**Developer Notes:**  
- Link to the seller’s profile or initiate a chat thread.  
- Pass seller ID and product ID to the chat route.

---

### 8. Unclear Flow After Product Upload
**Priority:** Medium  
**Issue:** Users are unsure what to do next after uploading a product.  
**Developer Notes:**  
- Add post-upload success screen with options: “View Listing”, “Share Product”, or “Return to Marketplace”.  

---

## 🎉 Events

### 9. No Option to Attend or RSVP
**Priority:** High  
**Issue:** Users cannot attend events due to missing RSVP button or feature.  
**Developer Notes:**  
- Add “Attend” button with backend endpoint to mark attendance.  
- Reflect number of attendees dynamically.

---

### 10. Text Overflow in Event Cards
**Priority:** Low  
**Issue:** Text does not fit correctly within event boxes.  
**Developer Notes:**  
- Add responsive CSS for card containers.  
- Use `text-overflow: ellipsis;` or dynamic height adjustment.

---

### 11. Create Event Page Scroll Issue
**Priority:** High  
**Issue:** Users cannot scroll down to the “Create” button on smaller screens.  
**Developer Notes:**  
- Enable vertical scrolling for the form container.  
- Consider fixed-position “Create” button at bottom of viewport.

---

## 👤 Profile

### 12. Profile Photos Distorted
**Priority:** Medium  
**Issue:** Uploaded photos appear stretched or bent.  
**Developer Notes:**  
- Use CSS `object-fit: cover; border-radius: 50%;` for circular avatars.  
- Maintain consistent image dimensions (e.g. 150x150px).

---

## 💬 Messages (DMs)

### 13. Cannot View Friend’s Profile in Chat
**Priority:** Medium  
**Issue:** Users cannot click on profile photo or name in DM to open user profile.  
**Developer Notes:**  
- Add `onClick` or link routing to user profile from chat header.  
- Reuse existing profile route component.

---

## 🏢 Nearby Businesses

### 14. Layout and Screen Fit Issues
**Priority:** High  
**Issue:** Page content overflows and does not adapt to various screen sizes.  
**Developer Notes:**  
- Apply responsive layout structure.  
- Test mobile and desktop views separately.

---

### 15. Cannot Scroll to Create Business Button
**Priority:** High  
**Issue:** Form content not fully visible; users cannot complete creation.  
**Developer Notes:**  
- Enable scrollable container or dynamic height adjustment.  
- Test viewport behavior with long forms.

---

## 🌐 General Responsiveness Issues

### 16. Desktop View Locked to Mobile Layout
**Priority:** High  
**Issue:** App maintains mobile view even on desktop screens.  
**Developer Notes:**  
- Review CSS media queries and responsive breakpoints.  
- Ensure viewport meta tag is correctly configured.

---

### 17. Inconsistent Layout Across Devices
**Priority:** High  
**Issue:** Multiple elements across pages fail to scale or align properly.  
**Developer Notes:**  
- Standardize layout system (Flexbox or CSS Grid).  
- Consider using a responsive framework (e.g. TailwindCSS, Bootstrap).

---

## 💼 Businesses / Featured Section

### 18. Featured Section Not Interactive
**Priority:** Medium  
**Issue:** “Featured” area does not expand or link to detailed business pages.  
**Developer Notes:**  
- Add link or modal for featured business details.  
- Optionally create a dedicated “Featured Businesses” page.

---

### 19. No Option to View Seller Profile
**Priority:** Medium  
**Issue:** Buyers cannot access seller profile from product or business listing.  
**Developer Notes:**  
- Add “View Seller Profile” button linking to user profile page.  
- Pass seller ID to route.

---

## ⚙️ GENERAL RECOMMENDATIONS

1. **Implement Global Responsiveness Fixes**  
   - Apply consistent responsive design system (Tailwind, Bootstrap, or custom CSS Grid).  
   - Test across multiple screen sizes: 480px (mobile), 768px (tablet), 1024px (desktop), 1440px (wide).

2. **Refine User Flow & Feedback**
   - Provide clear navigation after each action (upload, post, event creation).  
   - Include confirmation messages and redirects.

3. **Testing & Quality Assurance**
   - Conduct QA testing on major browsers and devices.  
   - Perform regression testing after UI changes.

---

**Prepared by:** Caleb Oyelowo  
**Date:** October 2025  
**Version:** v1.0  
