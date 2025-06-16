-- CreateIndex
CREATE INDEX "Course_name_idx" ON "Course"("name");

-- CreateIndex
CREATE INDEX "Course_code_idx" ON "Course"("code");

-- CreateIndex
CREATE INDEX "Course_verified_idx" ON "Course"("verified");

-- CreateIndex
CREATE INDEX "Course_departmentCode_idx" ON "Course"("departmentCode");

-- CreateIndex
CREATE INDEX "Course_departmentCode_createdAt_idx" ON "Course"("departmentCode", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Course_verified_createdAt_idx" ON "Course"("verified", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Department_name_idx" ON "Department"("name");

-- CreateIndex
CREATE INDEX "Department_avgRating_idx" ON "Department"("avgRating" DESC);

-- CreateIndex
CREATE INDEX "Professor_name_idx" ON "Professor"("name");

-- CreateIndex
CREATE INDEX "Professor_departmentCode_idx" ON "Professor"("departmentCode");

-- CreateIndex
CREATE INDEX "Professor_departmentCode_createdAt_idx" ON "Professor"("departmentCode", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Review_professorId_type_createdAt_idx" ON "Review"("professorId", "type", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Review_courseCode_type_createdAt_idx" ON "Review"("courseCode", "type", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Review_type_createdAt_idx" ON "Review"("type", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Review_professorId_courseCode_idx" ON "Review"("professorId", "courseCode");

-- CreateIndex
CREATE INDEX "Review_userId_createdAt_idx" ON "Review"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ReviewReport_createdAt_idx" ON "ReviewReport"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "ReviewVote_userId_idx" ON "ReviewVote"("userId");
