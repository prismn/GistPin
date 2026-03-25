import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGistsTable1700000000001 implements MigrationInterface {
  name = 'CreateGistsTable1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "gists" (
        "id"              UUID                NOT NULL DEFAULT gen_random_uuid(),
        "content"         TEXT                NOT NULL,
        "location_cell"   VARCHAR(20),
        "content_hash"    VARCHAR(100),
        "stellar_gist_id" VARCHAR(80),
        "tx_hash"         VARCHAR(80),
        "location"        geography(Point, 4326),
        "created_at"      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_gists_id" PRIMARY KEY ("id")
      )
    `);

    // B-tree index for cell-based lookups
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_gists_location_cell"
        ON "gists" ("location_cell")
    `);

    // GiST spatial index for ST_DWithin radius queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_gists_location"
        ON "gists" USING GIST ("location")
    `);

    // Cursor pagination index
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_gists_created_at"
        ON "gists" ("created_at" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_gists_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_gists_location"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_gists_location_cell"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "gists"`);
  }
}
