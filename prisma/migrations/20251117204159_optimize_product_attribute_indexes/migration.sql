-- CreateIndex
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");

-- CreateIndex
CREATE INDEX "Product_priceCents_idx" ON "Product"("priceCents");

-- CreateIndex
CREATE INDEX "Product_status_categoryId_createdAt_idx" ON "Product"("status", "categoryId", "createdAt");

-- CreateIndex
CREATE INDEX "ProductAttribute_attributeTypeId_numberValue_idx" ON "ProductAttribute"("attributeTypeId", "numberValue");

-- CreateIndex
CREATE INDEX "ProductAttribute_attributeTypeId_stringValue_idx" ON "ProductAttribute"("attributeTypeId", "stringValue");
