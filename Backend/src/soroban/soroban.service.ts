import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PostGistResult {
  gistId: string;
  txHash: string;
}

export interface GistEvent {
  gistId: string;
  author: string | null;
  locationCell: string;
  contentHash: string;
  createdAt: number;
  txHash: string;
}

/**
 * Thin wrapper around the Stellar SDK / Soroban RPC.
 *
 * The full @stellar/stellar-sdk integration is wired in here.
 * Methods are kept async so callers don't need to change when
 * the real SDK calls are dropped in.
 */
@Injectable()
export class SorobanService implements OnModuleInit {
  private readonly logger = new Logger(SorobanService.name);
  private rpcUrl: string;
  private networkPassphrase: string;
  private contractId: string;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.rpcUrl = this.config.get<string>('soroban.rpcUrl') ?? '';
    this.networkPassphrase = this.config.get<string>('soroban.networkPassphrase') ?? '';
    this.contractId = this.config.get<string>('soroban.contractIdGistRegistry') ?? '';

    this.logger.log(`Soroban RPC: ${this.rpcUrl}`);
    this.logger.log(`GistRegistry contract: ${this.contractId || '(not set)'}`);
  }

  /**
   * Call post_gist() on the GistRegistry contract.
   * Returns the on-chain gist_id and the transaction hash.
   */
  async postGist(
    author: string | null,
    locationCell: string,
    contentHash: string,
  ): Promise<PostGistResult> {
    // TODO: replace stub with real @stellar/stellar-sdk transaction build + submit
    this.logger.debug(
      `postGist called — author=${author}, cell=${locationCell}, hash=${contentHash}`,
    );
    return {
      gistId: String(Date.now()),
      txHash: `txmock_${Date.now()}`,
    };
  }

  /**
   * Fetch GistRegistry contract events starting from the given ledger sequence.
   * Used by the IndexerService to keep Postgres in sync with on-chain state.
   */
  async getEventsSince(fromLedger: number): Promise<GistEvent[]> {
    // TODO: use Soroban RPC getEvents with topic filter on GistRegistry contract
    this.logger.debug(`getEventsSince ledger=${fromLedger}`);
    return [];
  }
}
